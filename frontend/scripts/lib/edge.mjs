// Shared helpers for the screenshot scripts: find Edge, build the app, serve it and drive Edge
// over the DevTools protocol on a plain websocket.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../..", import.meta.url));

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function findEdge() {
  const bases = [process.env["ProgramFiles(x86)"], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean);
  const candidates = [process.env.EDGE_PATH, ...bases.map((b) => join(b, "Microsoft", "Edge", "Application", "msedge.exe"))];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) {
    console.error("Microsoft Edge was not found. Install it or set EDGE_PATH to msedge.exe.");
    process.exit(1);
  }
  return found;
}

function newestMtime(path) {
  if (!existsSync(path)) return 0;
  if (!statSync(path).isDirectory()) return statSync(path).mtimeMs;
  return Math.max(0, ...readdirSync(path).map((name) => newestMtime(join(path, name))));
}

export function ensureBuild(force) {
  const built = newestMtime(join(root, "dist", "index.html"));
  const source = Math.max(newestMtime(join(root, "src")), newestMtime(join(root, "public")), newestMtime(join(root, "index.html")));
  if (!force && built > source) return;
  console.log("Building the app");
  const result = spawnSync("npm run build", { cwd: root, shell: true, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitFor(url, what) {
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {
      // not up yet
    }
    await sleep(250);
  }
  throw new Error(`${what} did not answer at ${url}`);
}

// Minimal DevTools client: send(method, params) resolves with the result.
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error("Could not open the DevTools websocket"));
  });
  let next = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method) {
      listeners.forEach((fn) => fn(msg));
    }
  };
  return {
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        next += 1;
        pending.set(next, { resolve, reject });
        ws.send(JSON.stringify({ id: next, method, params }));
      }),
    once: (method) =>
      new Promise((resolve) => {
        const fn = (msg) => {
          if (msg.method !== method) return;
          listeners.delete(fn);
          resolve();
        };
        listeners.add(fn);
      }),
    close: () => ws.close(),
  };
}

// Starts the preview server and a headless Edge. Always call stop(), it ends both by PID.
export async function startSession() {
  const edge = findEdge();
  const port = await freePort();
  const debugPort = await freePort();
  const vite = join(root, "node_modules", "vite", "bin", "vite.js");
  const server = spawn(process.execPath, [vite, "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: root,
    stdio: "ignore",
  });
  const profile = mkdtempSync(join(tmpdir(), "shots-edge-"));
  const browser = spawn(
    edge,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--disable-extensions",
      "--allow-file-access-from-files",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let page = null;
  const stop = async () => {
    page?.close();
    server.kill();
    spawnSync("taskkill", ["/PID", String(browser.pid), "/T", "/F"], { stdio: "ignore" });
    await sleep(1000);
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 });
    } catch {
      // the temporary profile is cleaned up by the system later
    }
  };
  try {
    const base = `http://127.0.0.1:${port}`;
    await waitFor(base, "Preview server");
    const targets = await (await waitFor(`http://127.0.0.1:${debugPort}/json/list`, "Edge")).json();
    const target = targets.find((t) => t.type === "page");
    if (!target) throw new Error("Edge opened no page");
    page = await connect(target.webSocketDebuggerUrl);
    await page.send("Page.enable");
    await page.send("Emulation.setScrollbarsHidden", { hidden: true });
    return { base, page, stop };
  } catch (error) {
    await stop();
    throw error;
  }
}

// Opens a url at a given viewport and waits until it has loaded.
export async function open(page, url, width, height, scale = 2, settle = 1200) {
  await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
  const loaded = page.once("Page.loadEventFired");
  await page.send("Page.navigate", { url });
  await loaded;
  await sleep(settle);
}

export async function evaluate(page, expression) {
  const { result } = await page.send("Runtime.evaluate", { expression, returnByValue: true });
  return result.value;
}
