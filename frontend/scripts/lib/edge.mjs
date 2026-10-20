// Shared helpers for the screenshot scripts: find Edge, build the app, serve it and drive Edge
// over the DevTools protocol on a plain websocket. Everything it contacts is on 127.0.0.1.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join } from "node:path";
import { PUBLIC_DIR, ROOT, SAFE_NAME, safeJoin } from "./paths.mjs";

export { ROOT } from "./paths.mjs";

const LOOPBACK_HOST = "127.0.0.1";
const LOOPBACK_NAMES = [LOOPBACK_HOST, "localhost"];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function checkPort(port) {
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error(`Port out of range: ${port}`);
  return port;
}

// Every request this tooling makes goes to this machine on a known port. Called before fetch and WebSocket.
export function assertLoopback(url, port) {
  const parsed = new URL(url);
  if (!["http:", "ws:"].includes(parsed.protocol)) throw new Error(`Not a loopback url: ${parsed.protocol}`);
  if (!LOOPBACK_NAMES.includes(parsed.hostname)) throw new Error(`Not a loopback host: ${parsed.hostname}`);
  if (Number(parsed.port) !== checkPort(port)) throw new Error(`Unexpected port ${parsed.port}, expected ${port}`);
  return parsed.href;
}

function isEdgeExe(path) {
  return typeof path === "string" && isAbsolute(path) && basename(path).toLowerCase() === "msedge.exe" && existsSync(path) && statSync(path).isFile();
}

export function findEdge() {
  const bases = [process.env["ProgramFiles(x86)"], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean);
  const override = process.env.EDGE_PATH;
  if (override && !isEdgeExe(override)) console.warn("Ignoring EDGE_PATH, it must be an absolute path to an existing msedge.exe");
  const candidates = [isEdgeExe(override) ? override : null, ...bases.map((b) => join(b, "Microsoft", "Edge", "Application", "msedge.exe"))];
  const found = candidates.find((p) => p && isEdgeExe(p));
  if (!found) {
    console.error("Microsoft Edge was not found. Install it or set EDGE_PATH to msedge.exe.");
    process.exit(1);
  }
  return found;
}

// path is a fixed location or a safeJoin of one with an entry name that passed the name check.
function newestMtime(path) {
  if (!existsSync(path)) return 0;
  if (!statSync(path).isDirectory()) return statSync(path).mtimeMs;
  const names = readdirSync(path).filter((name) => SAFE_NAME.test(name));
  return Math.max(0, ...names.map((name) => newestMtime(safeJoin(path, name))));
}

export function ensureBuild(force) {
  const built = newestMtime(safeJoin(ROOT, "dist", "index.html"));
  const source = Math.max(newestMtime(safeJoin(ROOT, "src")), newestMtime(PUBLIC_DIR), newestMtime(safeJoin(ROOT, "index.html")));
  if (!force && built > source) return;
  console.log("Building the app");
  const result = spawnSync("npm run build", { cwd: ROOT, shell: true, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, LOOPBACK_HOST, () => {
      const { port } = server.address();
      server.close(() => resolve(checkPort(port)));
    });
  });
}

async function waitFor(url, port, what) {
  const checked = assertLoopback(url, port);
  for (let i = 0; i < 80; i += 1) {
    try {
      const res = await fetch(checked);
      if (res.ok) return res;
    } catch {
      // not up yet
    }
    await sleep(250);
  }
  throw new Error(`${what} did not answer at ${checked}`);
}

// Minimal DevTools client: send(method, params) resolves with the result.
async function connect(wsUrl, port) {
  const ws = new WebSocket(assertLoopback(wsUrl, port));
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
  const vite = safeJoin(ROOT, "node_modules", "vite", "bin", "vite.js");
  const server = spawn(process.execPath, [vite, "preview", "--host", LOOPBACK_HOST, "--port", String(port), "--strictPort"], {
    cwd: ROOT,
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
    const base = `http://${LOOPBACK_HOST}:${port}`;
    await waitFor(base, port, "Preview server");
    const targets = await (await waitFor(`http://${LOOPBACK_HOST}:${debugPort}/json/list`, debugPort, "Edge")).json();
    const target = targets.find((t) => t.type === "page");
    if (!target) throw new Error("Edge opened no page");
    page = await connect(target.webSocketDebuggerUrl, debugPort);
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
