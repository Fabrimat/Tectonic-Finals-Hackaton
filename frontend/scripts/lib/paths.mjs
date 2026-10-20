// Fixed locations and name allowlists for the screenshot and deck scripts. Every file path the
// scripts read or write is built from these constants, never from argv, env or request input.
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
export const PUBLIC_DIR = resolve(ROOT, "public");
export const SHOTS_DIR = resolve(ROOT, "shots");
export const SLIDES_DIR = resolve(SHOTS_DIR, "slides");
export const DECK_DIR = resolve(SHOTS_DIR, "deck");
export const DECK_SRC = resolve(ROOT, "scripts", "deck");

export const SAFE_NAME = /^[a-z0-9._-]+$/i;

// Joins parts onto a base and refuses anything that would leave the base.
export function safeJoin(base, ...parts) {
  const resolved = resolve(base, ...parts);
  const rel = relative(base, resolved);
  if (rel.startsWith("..") || isAbsolute(rel)) throw new Error(`Path leaves its base directory: ${parts.join("/")}`);
  return resolved;
}

// Returns the name when it is in the list, otherwise throws. Exact string match.
export function allowed(list, name, what) {
  if (typeof name !== "string" || !SAFE_NAME.test(name) || !list.includes(name)) {
    throw new Error(`Unknown ${what}: ${String(name).slice(0, 60)}`);
  }
  return name;
}

// Command line flags the scripts accept. Anything else stops the run.
export function parseFlags(argv, flags) {
  const found = new Set();
  const rest = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      if (!flags.includes(arg)) throw new Error(`Unknown option ${arg.slice(0, 40)}. Known: ${flags.join(", ") || "none"}`);
      found.add(arg);
    } else {
      rest.push(arg);
    }
  }
  return { flags: found, rest };
}

export const DECK_SLIDE_FILES = [
  "01-title.html",
  "02-deadline.html",
  "03-gap.html",
  "04-ladder.html",
  "05-consent.html",
  "06-plan.html",
  "07-ecosystem.html",
  "08-value.html",
  "09-bakery.html",
];

// Base names of the phone exports and the 16:9 slides the deck can place, and its extra assets.
export const PHONE_NAMES = [
  "home-household-forming",
  "home-household-ready",
  "home-bakery-ready",
  "whisper",
  "forming",
  "ready-confirm",
  "evidence",
  "bakery-evidence",
  "home-clock",
  "ready-board",
  "ready-decided",
  "bakery-forming",
  "bakery-board",
  "journey-decide",
  "journey-act",
  "journey-result",
];
export const PHONE_PARTS = ["", "-part1", "-part2", "-part3", "-part4", "-decided", "-not-needed"];
export const SLIDE_IMAGES = [
  "title-phone",
  "ladder-household",
  "consent-layers",
  "decisions-household",
  "bakery-forming-ready",
  "landing",
  "dashboard-household",
  "dashboard-bakery",
  "dashboard-cluster-household",
  "dashboard-cluster-bakery",
  "numbers-household",
  "numbers-bakery",
  "ecosystem-map",
];
export const ASSET_NAMES = ["map"];
