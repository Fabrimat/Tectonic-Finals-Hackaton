import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { scenarios } from "./scenarios.js";

const read = (path) => JSON.parse(readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8"));

test("the frontend catalogue is the same file content as the backend catalogue", () => {
  assert.deepEqual(read("./catalogue.json"), read("../../../backend/data/catalogue.json"));
});

const backend = read("../../../backend/data/scenarios.json");

function frontendIds(scenario) {
  const ids = scenario.stages.ready.steps.map((s) => s.catalogueId).filter(Boolean);
  return [...new Set(ids)];
}

function backendIds(scenario) {
  return [...new Set(scenario.plans.ready.steps.map((s) => s.id))];
}

// Known differences, kept explicit so everything else stays strict.
// The backend plan proposes a heat pump and a business charging point as capabilities the
// catalogue does not list. The browser shows the charging point the same way (null id,
// proposed), but offers the heating quote from the catalogue, so the ids differ.
// The household also shows a "not needed" card for a renovation loan that the backend
// plan does not produce.
const allowed = {
  "household-maes": {
    frontendOnly: ["heating-quote-impact-us-today", "renovation-loan"],
    backendOnly: ["heat-pump-installation"],
  },
  "bakery-leuven": {
    frontendOnly: [],
    backendOnly: ["blink-charging-business"],
  },
};

test("every scenario has a cached backend plan and the other way round", () => {
  assert.deepEqual(scenarios.map((s) => s.id).sort(), backend.map((s) => s.id).sort());
});

for (const scenario of scenarios) {
  test(`ready catalogue ids match the backend plan for ${scenario.id}`, () => {
    const twin = backend.find((b) => b.id === scenario.id);
    const front = frontendIds(scenario);
    const back = backendIds(twin);
    const { frontendOnly, backendOnly } = allowed[scenario.id];
    assert.deepEqual(front.filter((id) => !back.includes(id)).sort(), [...frontendOnly].sort());
    assert.deepEqual(back.filter((id) => !front.includes(id)).sort(), [...backendOnly].sort());
  });
}
