// Renders the main states to PNG with the installed Microsoft Edge in headless mode.
// Edge is driven over the DevTools protocol on a plain websocket, so the viewport is exact.
// Usage: npm run shots [-- --build] [-- name ...]  (names filter the list, --build forces a build)
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(root, "shots");

// Size is [width, height]. A height of "fit" grows the frame to the whole page.
const phone = [390, 844];
const phoneFit = [390, "fit"];
const desktop = [1440, 900];
const desktopFit = [1440, "fit"];
const hh = "scenario=household-maes";
const bk = "scenario=bakery-leuven";
const quiet = "tools=0";
const allHousehold = "epc,estimate,insulation,heating,solar,group-purchase";

// name, path with query, size
export const shots = [
  ["landing", "/", desktop],
  ["home-whisper", `/app?${hh}&stage=whisper&${quiet}`, phone],
  ["home-forming", `/app?${hh}&stage=forming&${quiet}`, phone],
  ["home-ready", `/app?${hh}&stage=ready&${quiet}`, phone],
  ["home-ready-tall", `/app?${hh}&stage=ready&${quiet}`, phoneFit],
  ["home-bakery-whisper", `/app?${bk}&stage=whisper&${quiet}`, phone],
  ["home-bakery-ready", `/app?${bk}&stage=ready&${quiet}`, phone],
  ["whisper", `/app?${hh}&stage=whisper&open=1&${quiet}`, phoneFit],
  ["whisper-confirmed", `/app?${hh}&stage=whisper&confirmed=1&open=1&${quiet}`, phoneFit],
  ["forming", `/app?${hh}&stage=forming&open=1&${quiet}`, phoneFit],
  ["forming-confirmed", `/app?${hh}&stage=forming&confirmed=1&open=1&${quiet}`, phoneFit],
  ["ready-confirm", `/app?${hh}&stage=ready&open=1&${quiet}`, phoneFit],
  ["ready-board", `/app?${hh}&stage=ready&confirmed=1&open=1&${quiet}`, phoneFit],
  ["ready-decided", `/app?${hh}&stage=ready&accepted=epc,estimate,insulation&deferred=heating&rejected=solar&open=1&${quiet}`, phoneFit],
  ["bakery-forming", `/app?${bk}&stage=forming&open=1&${quiet}`, phoneFit],
  ["bakery-board", `/app?${bk}&stage=ready&accepted=3&open=1&${quiet}`, phoneFit],
  ["dashboard", `/partner?${hh}&stage=ready&accepted=${allHousehold}&partner=Impact%20us%20today&${quiet}`, desktop],
  ["dashboard-bakery", `/partner?${bk}&stage=ready&accepted=4&partner=Samen%20Overstappen&${quiet}`, desktop],
  ["numbers", `/partner/numbers?${hh}&stage=ready&accepted=${allHousehold},energy-loan,home-insurance&${quiet}`, desktopFit],
  ["numbers-bakery", `/partner/numbers?${bk}&stage=ready&accepted=5&${quiet}`, desktopFit],
  ["map", "/map", desktop],
];

function findEdge() {
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

function ensureBuild(force) {
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function capture(page, url, file, [width, height]) {
  const base = typeof height === "number" ? height : 900;
  const metrics = (h) => ({ width, height: h, deviceScaleFactor: 2, mobile: false });
  await page.send("Emulation.setDeviceMetricsOverride", metrics(base));
  const loaded = page.once("Page.loadEventFired");
  await page.send("Page.navigate", { url });
  await loaded;
  await sleep(1200);
  let shotHeight = base;
  if (height === "fit") {
    const { result } = await page.send("Runtime.evaluate", { expression: "document.documentElement.scrollHeight", returnByValue: true });
    shotHeight = Math.max(base, Math.ceil(result.value));
    await page.send("Emulation.setDeviceMetricsOverride", metrics(shotHeight));
    await sleep(400);
  }
  const { data } = await page.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(file, Buffer.from(data, "base64"));
  return `${width}x${shotHeight}`;
}

async function main() {
  const args = process.argv.slice(2);
  const names = args.filter((a) => !a.startsWith("--"));
  const list = names.length ? shots.filter(([name]) => names.includes(name)) : shots;
  if (list.length === 0) {
    console.error(`No shot matches. Known: ${shots.map(([n]) => n).join(", ")}`);
    process.exit(1);
  }
  const edge = findEdge();
  ensureBuild(args.includes("--build"));
  mkdirSync(outDir, { recursive: true });

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
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let failed = 0;
  let page = null;
  try {
    const base = `http://127.0.0.1:${port}`;
    await waitFor(base, "Preview server");
    const targets = await (await waitFor(`http://127.0.0.1:${debugPort}/json/list`, "Edge")).json();
    const target = targets.find((t) => t.type === "page");
    if (!target) throw new Error("Edge opened no page");
    page = await connect(target.webSocketDebuggerUrl);
    await page.send("Page.enable");
    await page.send("Emulation.setScrollbarsHidden", { hidden: true });
    for (const [name, path, size] of list) {
      const file = join(outDir, `${name}.png`);
      rmSync(file, { force: true });
      try {
        const done = await capture(page, base + path, file, size);
        console.log(`${name}.png  ${done}  ${path}`);
      } catch (error) {
        failed += 1;
        console.error(`${name}: ${error.message}`);
      }
    }
  } finally {
    page?.close();
    process.kill(server.pid);
    spawnSync("taskkill", ["/PID", String(browser.pid), "/T", "/F"], { stdio: "ignore" });
    await sleep(500);
    rmSync(profile, { recursive: true, force: true });
  }
  if (failed) process.exit(1);
  console.log(`Wrote ${list.length} images to ${outDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
