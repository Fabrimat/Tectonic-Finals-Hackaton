// Renders the slide set with the installed Microsoft Edge in headless mode.
// Usage: npm run shots:slides [-- --build]
//
// Output goes to shots/slides (git ignored):
//   *.png            16:9 slides, 1920x1080 at device scale 2 (3840x2160 pixels)
//   phones/NAME-screen.png  the phone screen at 390x844 at scale 2, tall states as NAME-part1, NAME-part2, ...
//   phones/NAME-framed.png  the same screen in a slim rounded frame, transparent outside the frame
//   INDEX.txt        file, pixel size and the outline slide each file is for
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { inflateSync } from "node:zlib";
import { ensureBuild, evaluate, open, sleep, startSession } from "./lib/edge.mjs";
import { PHONE_NAMES, PHONE_PARTS, SLIDES_DIR, SLIDE_IMAGES, allowed, parseFlags, safeJoin } from "./lib/paths.mjs";
import { decisionQuery } from "./lib/states.mjs";

const slidesDir = SLIDES_DIR;
const phonesDir = safeJoin(slidesDir, "phones");
const tmpDir = safeJoin(slidesDir, ".compose");

// Every file this script reads or writes is looked up by key in these maps. The maps are built once
// from the constant name lists, so no fs call takes a path made from arguments or the environment.
const OUT = new Map([["INDEX.txt", safeJoin(slidesDir, "INDEX.txt")]]);
for (const name of SLIDE_IMAGES) OUT.set(`${name}.png`, safeJoin(slidesDir, `${name}.png`));
for (const name of PHONE_NAMES) {
  for (const part of PHONE_PARTS) {
    for (const kind of ["screen", "framed"]) OUT.set(`phones/${name}${part}-${kind}.png`, safeJoin(phonesDir, `${name}${part}-${kind}.png`));
  }
}
const TMP = new Map([
  ["frame", safeJoin(tmpDir, "frame.html")],
  ["slide", safeJoin(tmpDir, "slide.html")],
]);

function outPath(key) {
  const path = OUT.get(key);
  if (!path) throw new Error(`Unknown output file: ${String(key).slice(0, 60)}`);
  return path;
}
function tmpPath(key) {
  const path = TMP.get(key);
  if (!path) throw new Error(`Unknown temporary file: ${String(key).slice(0, 60)}`);
  return path;
}

const PHONE = [390, 844];
const SLIDE = [1920, 1080];
const HEADER = 60;
const TAB_BAR = 76;
const SCROLL_STEP = PHONE[1] - HEADER - TAB_BAR;
const BACKGROUND = "#eef3f8";

const hh = "scenario=household-maes";
const bk = "scenario=bakery-leuven";
const quiet = "tools=0";
const decideHh = decisionQuery("household-maes");
const decideBk = decisionQuery("bakery-leuven");

// Phone screens. A state taller than the phone is captured by scrolling, so the sticky header and
// tab bar stay on every part, like a real phone.
const phoneStates = [
  // single: true captures the home screen as one 844 px frame
  ["home-household-forming", `/app?${hh}&stage=forming&${quiet}`, "Slide 1, title screen, home with the forming card", true],
  ["home-household-ready", `/app?${hh}&stage=ready&${quiet}`, "Slide 4, home with the ready card", true],
  ["home-bakery-ready", `/app?${bk}&stage=ready&${quiet}`, "Slide 9, bakery home screen", true],
  ["whisper", `/app?${hh}&stage=whisper&open=1&${quiet}`, "Slide 4 and 5, whisper card with the analysis layer"],
  ["forming", `/app?${hh}&stage=forming&open=1&${quiet}`, "Slide 4, forming question"],
  ["ready-confirm", `/app?${hh}&stage=ready&open=1&${quiet}`, "Slide 5, confirm card with the four consent layers"],
  ["evidence", `/app?${hh}&stage=ready&open=1&evidence=1&${quiet}`, "Slide 5, the why disclosure with the evidence breakdown"],
  ["bakery-evidence", `/app?${bk}&stage=whisper&open=1&evidence=1&${quiet}`, "Slide 5 or 9, bakery evidence with the withheld line"],
  ["home-clock", `/app?${hh}&stage=whisper&clock=1&${quiet}`, "Slide 1, renovation clock hook", true],
  ["ready-board", `/app?${hh}&stage=ready&confirmed=1&open=1&${quiet}`, "Slide 6, plan board before any decision"],
  ["ready-decided", `/app?${hh}&stage=ready&${decideHh}&open=1&${quiet}`, "Slide 6, plan board with decisions and the not needed cards", false, [["decided", ".cx-state-deferred", 62], ["not-needed", ".cx-skip"]]],
  ["bakery-forming", `/app?${bk}&stage=forming&open=1&${quiet}`, "Slide 9, bakery forming question"],
  ["bakery-board", `/app?${bk}&stage=ready&${decideBk}&open=1&${quiet}`, "Slide 9, bakery plan board"],
];

// Desktop views. css is added after load to centre and cap the page for the 16:9 frame.
const centre = ".{root}{display:flex;flex-direction:column;min-height:100vh}.{main}{flex:1;display:flex;flex-direction:column;justify-content:center;width:100%}";
const portal = centre.replaceAll("{root}", "pp").replaceAll("{main}", "pp-main");
const desktopSlides = [
  {
    file: "landing.png",
    path: "/",
    css: ".landing{min-height:100vh;align-content:center;max-width:640px}",
    purpose: "Not in the outline, backup frame of the controls",
  },
  {
    file: "dashboard-household.png",
    zoom: 1.12,
    path: `/partner?${hh}&stage=ready&${decideHh}&partner=all&${quiet}`,
    css: portal,
    purpose: "Slide 8, advisor dashboard, household",
  },
  {
    file: "dashboard-bakery.png",
    zoom: 1.3,
    path: `/partner?${bk}&stage=ready&${decideBk}&partner=all&${quiet}`,
    css: portal,
    purpose: "Slide 8 or 9, advisor dashboard, bakery",
  },
  {
    file: "dashboard-cluster-household.png",
    zoom: 1.3,
    path: `/partner?${hh}&stage=ready&${decideHh}&cluster=1&partner=all&${quiet}`,
    css: portal,
    purpose: "Slide 8, neighbourhood groups card, household",
  },
  {
    file: "dashboard-cluster-bakery.png",
    zoom: 1.3,
    path: `/partner?${bk}&stage=ready&${decideBk}&cluster=1&partner=all&${quiet}`,
    css: portal,
    purpose: "Slide 8 or 9, neighbourhood groups card, trade street cohort, bakery",
  },
  {
    file: "numbers-household.png",
    path: `/partner/numbers?${hh}&stage=ready&${decideHh}&${quiet}`,
    css: `${portal}.pp-main{max-width:1560px}.pp-view{display:none}`,
    openDetails: true,
    purpose: "Slide 8, numbers and assumptions, household",
  },
  {
    file: "numbers-bakery.png",
    path: `/partner/numbers?${bk}&stage=ready&${decideBk}&${quiet}`,
    css: `${portal}.pp-main{max-width:1560px}.pp-view{display:none}`,
    openDetails: true,
    purpose: "Slide 8 or 9, numbers and assumptions, bakery",
  },
  {
    file: "ecosystem-map.png",
    path: "/map",
    // The side column keeps only its last two children, the flow legend.
    css: ".map{display:flex;flex-direction:column;min-height:100vh}.map-main{flex:1;align-items:center;justify-content:center;grid-template-columns:auto 380px;max-width:1800px;width:100%}.map-main svg{width:auto;height:calc(100vh - 170px)}.map-side>:not(:nth-last-child(-n+2)){display:none}",
    purpose: "Slide 7, ecosystem map",
  },
];

const rows = [];

function pngInfo(key) {
  const buf = readFileSync(outPath(key));
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf[25] };
}

// Decodes an 8 bit RGBA PNG and returns [r, g, b, a] at x, y. Enough to check corners without a library.
function pixelAt(key, x, y) {
  const buf = readFileSync(outPath(key));
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (buf[24] !== 8 || buf[25] !== 6) throw new Error(`${key} is not 8 bit RGBA`);
  let offset = 8;
  const chunks = [];
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    if (buf.toString("ascii", offset + 4, offset + 8) === "IDAT") chunks.push(buf.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const out = Buffer.alloc(stride * height);
  for (let row = 0; row < height; row += 1) {
    const filter = raw[row * (stride + 1)];
    const line = raw.subarray(row * (stride + 1) + 1, (row + 1) * (stride + 1));
    for (let i = 0; i < stride; i += 1) {
      const left = i >= 4 ? out[row * stride + i - 4] : 0;
      const up = row > 0 ? out[(row - 1) * stride + i] : 0;
      const upLeft = row > 0 && i >= 4 ? out[(row - 1) * stride + i - 4] : 0;
      let add = 0;
      if (filter === 1) add = left;
      else if (filter === 2) add = up;
      else if (filter === 3) add = (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        add = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      out[row * stride + i] = (line[i] + add) & 255;
    }
  }
  const at = y * stride + x * 4;
  return [out[at], out[at + 1], out[at + 2], out[at + 3]];
}

function record(key, purpose) {
  const { width, height } = pngInfo(key);
  rows.push([key, `${width}x${height}`, purpose]);
}

async function shoot(page, key, clip) {
  const params = { format: "png" };
  if (clip) params.clip = clip;
  const { data } = await page.send("Page.captureScreenshot", params);
  writeFileSync(outPath(key), Buffer.from(data, "base64"));
}

// Captures one phone state, scrolling for the parts. Returns the file paths.
async function exportPhone(page, base, [name, path, purpose, single, focus = []]) {
  await open(page, base + path, PHONE[0], PHONE[1]);
  const height = await evaluate(page, "document.documentElement.scrollHeight");
  const parts = single || height <= PHONE[1] ? 1 : 1 + Math.ceil((height - PHONE[1]) / SCROLL_STEP);
  const files = [];
  for (let i = 0; i < parts; i += 1) {
    await evaluate(page, `window.scrollTo(0, ${i * SCROLL_STEP})`);
    await sleep(250);
    const key = `phones/${parts === 1 ? name : `${name}-part${i + 1}`}-screen.png`;
    await shoot(page, key);
    files.push(key);
    record(key, `${purpose}${parts > 1 ? ` (part ${i + 1} of ${parts})` : ""}`);
  }
  // focus captures scroll a named element into the middle, for states where the interesting card is far down
  for (const [suffix, selector, offset = 0] of focus) {
    await evaluate(page, `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({ block: "center" }); window.scrollBy(0, ${offset})`);
    await sleep(250);
    const key = `phones/${name}-${suffix}-screen.png`;
    await shoot(page, key);
    files.push(key);
    record(key, `${purpose} (${suffix})`);
  }
  return files;
}

const frameCss = `
.phone{padding:9px;border-radius:52px;background:#16212c}
.phone img{display:block;width:390px;height:844px;border-radius:43px}
`;

function writeHtml(name, body) {
  writeFileSync(tmpPath(name), `<!doctype html><meta charset="utf-8"><title>${name}</title><style>html,body{margin:0}${body.css}</style>${body.html}`);
  return name;
}

const imgTag = (key) => `<div class="phone"><img src="${pathToFileURL(outPath(key)).href}" alt=""></div>`;

async function renderHtml(page, htmlName, [width, height], key, transparent = false) {
  if (transparent) await page.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
  try {
    await open(page, pathToFileURL(tmpPath(htmlName)).href, width, height, 2, 350);
    await shoot(page, key);
  } finally {
    if (transparent) await page.send("Emulation.setDefaultBackgroundColorOverride");
  }
}

const FRAMED = [PHONE[0] + 18, PHONE[1] + 18];
const alphaChecks = [];

async function frameOne(page, key, purpose) {
  const out = key.replace(/-screen\.png$/, "-framed.png");
  const html = writeHtml("frame", {
    css: `html,body{background:transparent}body{width:${FRAMED[0]}px;height:${FRAMED[1]}px}${frameCss}`,
    html: imgTag(key),
  });
  await renderHtml(page, html, FRAMED, out, true);
  record(out, `${purpose}, framed, transparent outside the frame`);
  const { width, height } = pngInfo(out);
  const corners = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]].map(([x, y]) => pixelAt(out, x, y)[3]);
  const centre = pixelAt(out, width >> 1, height >> 1)[3];
  alphaChecks.push({ out, corners, centre });
}

// Phones side by side on a 1920x1080 canvas. align "right" leaves the left side free for a title.
async function composeSlide(page, key, images, purpose, align = "center") {
  const justify = align === "right" ? "flex-end" : "center";
  const pad = align === "right" ? "padding-right:300px;" : "";
  const html = writeHtml("slide", {
    css: `body{width:${SLIDE[0]}px;height:${SLIDE[1]}px;background:${BACKGROUND};display:flex;align-items:center;justify-content:${justify};gap:72px;${pad}box-sizing:border-box}.phone{box-shadow:0 24px 60px rgba(0,48,87,.22)}${frameCss}`,
    html: images.map(imgTag).join(""),
  });
  await renderHtml(page, html, SLIDE, key);
  record(key, purpose);
}

// Full page views, scaled down only when they are taller than the frame.
async function desktopSlide(page, base, spec) {
  await open(page, base + spec.path, SLIDE[0], SLIDE[1]);
  await evaluate(
    page,
    `document.head.appendChild(Object.assign(document.createElement("style"), { textContent: ${JSON.stringify(`html,body{background:${BACKGROUND}}${spec.css}`)} }))`,
  );
  await sleep(300);
  if (spec.openDetails) {
    await evaluate(page, `document.querySelectorAll(".pp-toggle[aria-expanded=false]").forEach((b) => b.click())`);
    await sleep(300);
  }
  if (spec.zoom) {
    await evaluate(page, `document.documentElement.style.zoom = ${spec.zoom}; document.head.appendChild(Object.assign(document.createElement("style"), { textContent: ".pp{min-height:${SLIDE[1] / spec.zoom}px}" }))`);
    await sleep(300);
  }
  const height = await evaluate(page, "document.documentElement.scrollHeight");
  if (!spec.zoom && height > SLIDE[1]) {
    const zoom = SLIDE[1] / height;
    await evaluate(page, `document.documentElement.style.zoom = ${zoom}`);
    if (zoom < 0.7) console.warn(`Warning: ${spec.file} is scaled to ${Math.round(zoom * 100)}%, text may be small`);
    await sleep(300);
  }
  await shoot(page, spec.file);
  record(spec.file, spec.purpose);
}

async function main() {
  const { flags, rest: extra } = parseFlags(process.argv.slice(2), ["--build"]);
  if (extra.length) throw new Error("This command takes no names, only --build");
  for (const [name] of phoneStates) allowed(PHONE_NAMES, name, "phone state");
  for (const spec of desktopSlides) allowed(SLIDE_IMAGES, spec.file.replace(/\.png$/, ""), "slide");
  ensureBuild(flags.has("--build"));
  for (const dir of [phonesDir, tmpDir]) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
  }
  const { base, page, stop } = await startSession();
  try {
    const screens = {};
    for (const state of phoneStates) screens[state[0]] = await exportPhone(page, base, state);
    for (const state of phoneStates) {
      for (const file of screens[state[0]]) await frameOne(page, file, state[2]);
    }

    const part = (name, n = 1) => screens[name][Math.min(n, screens[name].length) - 1];
    const named = (name, suffix) => screens[name].find((f) => f.includes(`-${suffix}-screen`));

    await composeSlide(page, "title-phone.png", [part("home-household-forming")], "Slide 1, title, one phone on the right and room for the title text", "right");
    await composeSlide(
      page,
      "ladder-household.png",
      [part("whisper"), part("forming"), part("ready-confirm")],
      "Slide 4, intent ladder: whisper, forming, ready (opened cards, they show the stage best)",
    );
    await composeSlide(
      page,
      "consent-layers.png",
      [part("whisper"), part("ready-confirm"), part("ready-board")],
      "Slide 5, four consents: analysis, goal (confirm card), sharing (plan)",
    );
    await composeSlide(
      page,
      "decisions-household.png",
      [part("ready-decided", 1), named("ready-decided", "decided"), named("ready-decided", "not-needed")],
      "Slide 6, plan board with accepted, deferred, rejected and the not needed card",
    );
    await composeSlide(
      page,
      "bakery-forming-ready.png",
      [part("bakery-forming"), part("bakery-board")],
      "Slide 9, bakery: forming and ready side by side",
    );

    for (const spec of desktopSlides) await desktopSlide(page, base, spec);
  } finally {
    await stop();
    rmSync(tmpDir, { recursive: true, force: true });
  }

  const order = (a, b) => a[0].localeCompare(b[0]);
  const top = rows.filter((r) => !r[0].includes("/")).sort(order);
  const rest = rows.filter((r) => r[0].includes("/")).sort(order);
  const table = [...top, ...rest];
  const w0 = Math.max(...table.map((r) => r[0].length), 4);
  const w1 = Math.max(...table.map((r) => r[1].length), 4);
  const lines = [`${"File".padEnd(w0)}  ${"Size".padEnd(w1)}  Slide`, ...table.map((r) => `${r[0].padEnd(w0)}  ${r[1].padEnd(w1)}  ${r[2]}`)];
  const text = `${lines.join("\n")}\n`;
  writeFileSync(outPath("INDEX.txt"), text);
  console.log(text);
  const bad = alphaChecks.filter((c) => c.corners.some((a) => a !== 0) || c.centre !== 255);
  console.log(`Alpha check: ${alphaChecks.length} framed phones, corner alpha 0 and centre alpha 255 in ${alphaChecks.length - bad.length}`);
  for (const c of bad) console.warn(`Warning: unexpected alpha in ${c.out}: corners ${c.corners.join(",")}, centre ${c.centre}`);
  console.log(`Wrote ${table.length} images to ${slidesDir}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
