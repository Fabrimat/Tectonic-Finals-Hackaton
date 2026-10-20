// Builds the 9 slide pitch deck from scripts/deck: HTML slides, a PDF and a PNG per slide.
// Usage: npm run deck [-- --build]
//
// Output in shots/deck (git ignored): deck.html, deck.pdf, png/slide-N.png, notes.txt.
// The slides use the phone exports and screenshots from the slide set (npm run shots:slides),
// which this script runs first when they are missing. Figures on slide 8 come from
// src/data/synthetic.json through the same economics code as the numbers page.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { eurWhole, kbcEstimate } from "../src/apps/partner/economics.js";
import { leadsFor } from "../src/apps/partner/leadData.js";
import { scenarios, viewOf } from "../src/data/scenarios.js";
import data from "../src/data/synthetic.json" with { type: "json" };
import { ensureBuild, evaluate, open, root, sleep, startSession } from "./lib/edge.mjs";
import { decisionMap } from "./lib/states.mjs";

const deckSrc = join(root, "scripts", "deck");
const outDir = join(root, "shots", "deck");
const pngDir = join(outDir, "png");
const assetDir = join(outDir, "assets");
const slidesDir = join(root, "shots", "slides");
const SLIDE = [1920, 1080];
const TITLE = "Energy transition pitch";

const fileUrl = (path) => pathToFileURL(path).href;

function figures() {
  const base = scenarios.find((s) => s.id === "household-maes");
  const view = viewOf(base, "ready");
  const decisions = decisionMap("household-maes");
  const leads = leadsFor(view, decisions, true);
  const acceptedIds = Object.keys(decisions).filter((id) => decisions[id] === "accepted");
  const estimate = kbcEstimate({ acceptedIds, leads });
  const take = (id) => `${Math.round(data.kbcProducts.find((p) => p.id === id).conversion * 100)}%`;
  return {
    kbcValue: eurWhole(estimate.own),
    commission: eurWhole(estimate.commission.total),
    loanTake: take("energy-loan"),
    insuranceTake: take("home-insurance"),
    leasingTake: take("leasing"),
  };
}

// The map without the app header and side column, as a picture for slide 7.
async function captureMap(page, base) {
  await open(page, `${base}/map?tools=0`, 1500, 1000, 2, 800);
  await evaluate(
    page,
    `document.head.appendChild(Object.assign(document.createElement("style"), { textContent: ".map-bar,.map-side{display:none}.map-main{display:block;padding:0;max-width:none}.map-main svg{border:0;border-radius:0;width:1400px}body{background:#fff}" }))`,
  );
  await sleep(300);
  const box = await evaluate(page, `(() => { const r = document.querySelector(".map-main svg").getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })()`);
  const { data: png } = await page.send("Page.captureScreenshot", { format: "png", clip: { ...box, scale: 1 } });
  const file = join(assetDir, "map.png");
  writeFileSync(file, Buffer.from(png, "base64"));
  return file;
}

function resolveToken(token, values) {
  const [kind, name] = token.split(":");
  if (kind === "logo") return fileUrl(join(root, "public", "kbc-logo.svg"));
  if (kind === "phone") return fileUrl(join(slidesDir, "phones", `${name}-framed.png`));
  if (kind === "slide") return fileUrl(join(slidesDir, `${name}.png`));
  if (kind === "asset") return fileUrl(join(assetDir, `${name}.png`));
  if (kind === "fig") return values[name];
  throw new Error(`Unknown token {{${token}}}`);
}

function assemble(values) {
  const css = readFileSync(join(deckSrc, "style.css"), "utf8");
  const files = readdirSync(join(deckSrc, "slides")).filter((f) => f.endsWith(".html")).sort();
  const body = files
    .map((f) => readFileSync(join(deckSrc, "slides", f), "utf8").replace(/\{\{([^}]+)\}\}/g, (_, token) => {
      const value = resolveToken(token.trim(), values);
      if (value === undefined) throw new Error(`No value for {{${token}}} in ${f}`);
      return value;
    }))
    .join("\n");
  const file = join(outDir, "deck.html");
  writeFileSync(file, `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>${TITLE}</title>\n<style>\n${css}\n</style>\n</head>\n<body>\n${body}\n</body>\n</html>\n`);
  return { file, count: files.length, files };
}

function notesText() {
  const text = readFileSync(join(deckSrc, "notes.md"), "utf8");
  return text.replace(/^# .*\n+/, "").replace(/^## (\d+)\. (.*)$/gm, "Slide $1: $2").trim() + "\n";
}

function checkPdf(file, count) {
  const buf = readFileSync(file).toString("latin1");
  const pages = (buf.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  const box = buf.match(/\/MediaBox\s*\[([^\]]+)\]/)?.[1].trim().split(/\s+/).map(Number);
  const title = buf.match(/\/Title\s*\(([^)]*)\)/)?.[1] ?? buf.match(/\/Title\s*<([0-9A-Fa-f]+)>/)?.[1];
  return { pages, box, title, ok: pages === count };
}

async function main() {
  const args = process.argv.slice(2);
  ensureBuild(args.includes("--build"));
  if (!existsSync(join(slidesDir, "numbers-household.png")) || !existsSync(join(slidesDir, "phones", "ready-confirm-framed.png"))) {
    console.log("Rendering the slide set first");
    const run = spawnSync(process.execPath, [join(root, "scripts", "slides.mjs")], { cwd: root, stdio: "inherit" });
    if (run.status !== 0) process.exit(run.status ?? 1);
  }
  rmSync(outDir, { recursive: true, force: true });
  for (const dir of [outDir, pngDir, assetDir]) mkdirSync(dir, { recursive: true });

  const { base, page, stop } = await startSession();
  let result;
  try {
    await captureMap(page, base);
    const values = figures();
    const deck = assemble(values);
    await open(page, fileUrl(deck.file), SLIDE[0], SLIDE[1], 1, 1500);

    for (let i = 0; i < deck.count; i += 1) {
      const { data: png } = await page.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y: i * SLIDE[1], width: SLIDE[0], height: SLIDE[1], scale: 1 },
      });
      writeFileSync(join(pngDir, `slide-${i + 1}.png`), Buffer.from(png, "base64"));
    }
    const { data: pdf } = await page.send("Page.printToPDF", {
      paperWidth: SLIDE[0] / 96,
      paperHeight: SLIDE[1] / 96,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      printBackground: true,
      preferCSSPageSize: true,
    });
    writeFileSync(join(outDir, "deck.pdf"), Buffer.from(pdf, "base64"));
    result = { deck, values };
  } finally {
    await stop();
  }

  writeFileSync(join(outDir, "notes.txt"), notesText());
  const check = checkPdf(join(outDir, "deck.pdf"), result.deck.count);
  console.log(`Figures: ${JSON.stringify(result.values)}`);
  console.log(`PDF: ${check.pages} pages, media box ${check.box?.join(" ")} pt, title ${check.title ?? "none"}`);
  if (!check.ok) {
    console.error(`Expected ${result.deck.count} pages`);
    process.exit(1);
  }
  console.log(`Wrote the deck to ${outDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
