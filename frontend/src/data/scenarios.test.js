import assert from "node:assert/strict";
import test from "node:test";
import { catalogueItem, scenarios, stageOrder, viewOf } from "./scenarios.js";

const fake = (steps) => ({
  id: "f",
  domain: "d",
  person: { name: "n" },
  stages: { whisper: { lead: "w" }, ready: { lead: "r", steps } },
});

test("viewOf drops steps whose catalogue id is unknown and keeps the rest", () => {
  const known = scenarios[0].stages.ready.steps.find((s) => s.catalogueId).catalogueId;
  const view = viewOf(
    fake([
      { id: "ok", catalogueId: known },
      { id: "bad", catalogueId: "made-up-id" },
      { id: "free", catalogueId: null },
    ]),
    "ready",
  );
  assert.deepEqual(view.steps.map((s) => s.id), ["ok", "free"]);
});

test("viewOf falls back to the first stage for a stage the scenario lacks", () => {
  const view = viewOf(fake([]), "forming");
  assert.equal(view.stage, stageOrder[0]);
  assert.equal(view.lead, "w");
});

test("viewOf gives an empty signal and no steps for a stage without them", () => {
  const view = viewOf(fake([]), "whisper");
  assert.deepEqual(view.steps, []);
  assert.equal(view.signal.question, "");
});

test("every catalogue id used by the shipped scenarios exists", () => {
  for (const base of scenarios) {
    for (const key of stageOrder) {
      const raw = base.stages[key]?.steps ?? [];
      assert.equal(viewOf(base, key).steps.length, raw.length, `${base.id} ${key}`);
    }
  }
});

test("catalogueItem returns null for an unknown id", () => {
  assert.equal(catalogueItem("made-up-id"), null);
});
