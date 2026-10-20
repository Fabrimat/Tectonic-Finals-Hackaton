import assert from "node:assert/strict";
import test from "node:test";
import { catalogueItem, scenarios, segments, stageOrder, viewOf, windowLabel } from "./scenarios.js";

const fake = (steps) => ({
  id: "f",
  domain: "d",
  person: { name: "n" },
  segment: "household",
  area: { buildingStockAge: 10, historicCentre: false, openGroupRounds: [] },
  stages: { whisper: { monthsAhead: 20 }, ready: { monthsAhead: 1, steps } },
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
  assert.equal(view.monthsAhead, 20);
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

test("every stage of every scenario sits inside its segment window", () => {
  for (const base of scenarios) {
    assert.ok(segments[base.segment], `${base.id} has a known segment`);
    for (const key of stageOrder) {
      const [from, to] = segments[base.segment].windows[key];
      const months = base.stages[key].monthsAhead;
      assert.ok(months >= from && months <= to, `${base.id} ${key}: ${months} not in ${from} to ${to}`);
    }
  }
});

test("windows differ per segment and the view carries its own", () => {
  assert.equal(windowLabel("household", "whisper"), "12 to 36 months ahead");
  assert.equal(windowLabel("business", "whisper"), "6 to 12 months ahead");
  const household = scenarios.find((s) => s.segment === "household");
  const business = scenarios.find((s) => s.segment === "business");
  assert.notEqual(viewOf(household, "whisper").window, viewOf(business, "whisper").window);
});

test("only the ready stage allows a plan and carries steps", () => {
  for (const base of scenarios) {
    for (const key of stageOrder) {
      const view = viewOf(base, key);
      const hasPlan = view.allowedActions.some((a) => a.kind === "plan");
      assert.equal(hasPlan, key === "ready", `${base.id} ${key}`);
      if (!hasPlan) assert.deepEqual(view.steps, [], `${base.id} ${key} has no steps`);
    }
  }
});

test("whisper offers awareness and optional actions only, never a product", () => {
  for (const base of scenarios) {
    const kinds = viewOf(base, "whisper").allowedActions.map((a) => a.kind);
    assert.ok(kinds.includes("awareness"));
    assert.ok(kinds.includes("optional"));
    assert.deepEqual(kinds.filter((k) => !["awareness", "optional"].includes(k)), []);
    for (const a of base.stages.whisper.allowedActions) assert.ok(!a.catalogueId, "no catalogue product in whisper");
  }
});

test("opportunity comes before introduction and both come after the question", () => {
  for (const base of scenarios) {
    const kinds = viewOf(base, "forming").allowedActions.map((a) => a.kind);
    assert.deepEqual(kinds, ["question", "opportunity", "introduction"]);
  }
});

test("every view carries the area object on its signal", () => {
  for (const base of scenarios) {
    for (const key of stageOrder) {
      const { area } = viewOf(base, key).signal;
      assert.equal(typeof area.buildingStockAge, "number");
      assert.equal(typeof area.historicCentre, "boolean");
      assert.ok(Array.isArray(area.openGroupRounds));
    }
  }
});
