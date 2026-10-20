import { scenarios, stageOrder } from "../data/scenarios.js";

const DECISIONS = ["accepted", "deferred", "rejected"];

const isPlainObject = (value) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

// Step and action ids a scenario defines, across all of its stages.
function knownIds(scenario) {
  const ids = new Set();
  for (const content of Object.values(scenario.stages)) {
    for (const item of [...(content.steps ?? []), ...(content.allowedActions ?? [])]) {
      if (typeof item.id === "string") ids.add(item.id);
    }
  }
  return ids;
}

// Copies the entries that pass the check into a fresh object. Returns null when the
// value is not a plain object or when any entry fails.
function cleanMap(value, ids, allowedValue) {
  if (!isPlainObject(value)) return null;
  const out = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!ids.has(key) || !allowedValue(entry)) return null;
    out[key] = entry;
  }
  return out;
}

// Returns a state built only from known values, or null when the input is not a valid state.
// Used for anything that comes from outside this module: storage and other tabs.
export function parseState(value) {
  if (!isPlainObject(value)) return null;
  const scenario = scenarios.find((s) => s.id === value.scenarioId);
  if (!scenario || !stageOrder.includes(value.stage) || typeof value.confirmed !== "boolean") return null;
  const ids = knownIds(scenario);
  const decisions = cleanMap(value.decisions, ids, (v) => DECISIONS.includes(v));
  const choices = cleanMap(value.choices ?? {}, ids, (v) => v === true);
  if (!decisions || !choices) return null;
  return { scenarioId: scenario.id, stage: value.stage, confirmed: value.confirmed, decisions, choices };
}
