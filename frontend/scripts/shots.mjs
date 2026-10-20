// Renders the main states to PNG with the installed Microsoft Edge in headless mode.
// Usage: npm run shots [-- --build] [-- name ...]  (names filter the list, --build forces a build)
// The 16:9 slide set is a separate command, see slides.mjs.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ensureBuild, evaluate, open, root, sleep, startSession } from "./lib/edge.mjs";

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

async function capture(page, url, file, [width, height]) {
  const base = typeof height === "number" ? height : 900;
  await open(page, url, width, base);
  let shotHeight = base;
  if (height === "fit") {
    shotHeight = Math.max(base, Math.ceil(await evaluate(page, "document.documentElement.scrollHeight")));
    await page.send("Emulation.setDeviceMetricsOverride", { width, height: shotHeight, deviceScaleFactor: 2, mobile: false });
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
  ensureBuild(args.includes("--build"));
  mkdirSync(outDir, { recursive: true });
  const { base, page, stop } = await startSession();
  let failed = 0;
  try {
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
    await stop();
  }
  if (failed) process.exit(1);
  console.log(`Wrote ${list.length} images to ${outDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
