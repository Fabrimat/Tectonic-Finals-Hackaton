import assert from "node:assert/strict";
import test from "node:test";
import { scenarios, stageOrder } from "../data/scenarios.js";
import { initial, reduce } from "./reducer.js";

test("starts on the first scenario and first stage with nothing decided", () => {
  assert.deepEqual(initial(), {
    scenarioId: scenarios[0].id,
    stage: stageOrder[0],
    confirmed: false,
    decisions: {},
    choices: {},
  });
});

test("changing stage drops the confirmation and every decision", () => {
  let s = reduce(initial(), { type: "selectStage", stage: "ready" });
  s = reduce(s, { type: "confirmSignal" });
  s = reduce(s, { type: "decide", stepId: "epc", decision: "accepted" });
  s = reduce(s, { type: "selectStage", stage: "forming" });
  assert.equal(s.stage, "forming");
  assert.equal(s.confirmed, false);
  assert.deepEqual(s.decisions, {});
});

test("switching scenario restarts the ladder", () => {
  const busy = { scenarioId: "a", stage: "ready", confirmed: true, decisions: { x: "accepted" } };
  const s = reduce(busy, { type: "selectScenario", scenarioId: "b" });
  assert.deepEqual(s, { scenarioId: "b", stage: stageOrder[0], confirmed: false, decisions: {}, choices: {} });
});

test("decide overwrites one step and leaves the others", () => {
  let s = reduce(initial(), { type: "decide", stepId: "a", decision: "accepted" });
  s = reduce(s, { type: "decide", stepId: "b", decision: "deferred" });
  s = reduce(s, { type: "decide", stepId: "a", decision: "rejected" });
  assert.deepEqual(s.decisions, { a: "rejected", b: "deferred" });
});

test("clearDecision removes only that step and does not mutate the input", () => {
  const before = { ...initial(), decisions: { a: "accepted", b: "deferred" } };
  const after = reduce(before, { type: "clearDecision", stepId: "a" });
  assert.deepEqual(after.decisions, { b: "deferred" });
  assert.deepEqual(before.decisions, { a: "accepted", b: "deferred" });
});

test("declining the signal clears confirmation and decisions but keeps the stage", () => {
  const before = { scenarioId: "a", stage: "ready", confirmed: true, decisions: { a: "accepted" } };
  const after = reduce(before, { type: "declineSignal" });
  assert.equal(after.stage, "ready");
  assert.equal(after.confirmed, false);
  assert.deepEqual(after.decisions, {});
});

test("reset keeps the scenario but goes back to the first stage", () => {
  const before = { scenarioId: "b", stage: "ready", confirmed: true, decisions: { a: "accepted" } };
  assert.deepEqual(reduce(before, { type: "reset" }), {
    scenarioId: "b",
    stage: stageOrder[0],
    confirmed: false,
    decisions: {},
    choices: {},
  });
});

test("an unknown action returns the same state", () => {
  const s = initial();
  assert.equal(reduce(s, { type: "nope" }), s);
});

test("choosing an optional action is remembered and can be undone", () => {
  let s = reduce(initial(), { type: "choose", id: "epc-check" });
  s = reduce(s, { type: "choose", id: "meter-link" });
  assert.deepEqual(s.choices, { "epc-check": true, "meter-link": true });
  s = reduce(s, { type: "unchoose", id: "epc-check" });
  assert.deepEqual(s.choices, { "meter-link": true });
});

test("changing stage or declining clears the optional choices", () => {
  const before = { ...initial(), confirmed: true, choices: { "epc-check": true } };
  assert.deepEqual(reduce(before, { type: "selectStage", stage: "forming" }).choices, {});
  assert.deepEqual(reduce(before, { type: "declineSignal" }).choices, {});
});
