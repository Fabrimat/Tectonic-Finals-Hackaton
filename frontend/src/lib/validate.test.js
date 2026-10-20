import assert from "node:assert/strict";
import test from "node:test";
import { scenarios, stageOrder } from "../data/scenarios.js";
import { initial } from "./reducer.js";
import { parseState } from "./validate.js";

const scenario = scenarios[0];
const stepId = Object.values(scenario.stages)
  .flatMap((c) => c.steps ?? [])
  .find((s) => s.kind === "action").id;
const optionalId = Object.values(scenario.stages)
  .flatMap((c) => c.allowedActions ?? [])
  .find((a) => a.id).id;

test("accepts the initial state and a populated one", () => {
  assert.deepEqual(parseState(initial()), initial());
  const full = {
    scenarioId: scenario.id,
    stage: stageOrder[2],
    confirmed: true,
    decisions: { [stepId]: "accepted" },
    choices: { [optionalId]: true },
  };
  assert.deepEqual(parseState(full), full);
});

test("rejects values that are not objects", () => {
  for (const bad of [null, undefined, [], "state", 42, true, () => {}]) assert.equal(parseState(bad), null);
});

test("rejects unknown scenario and stage ids", () => {
  assert.equal(parseState({ ...initial(), scenarioId: "nope" }), null);
  assert.equal(parseState({ ...initial(), scenarioId: 7 }), null);
  assert.equal(parseState({ ...initial(), stage: "later" }), null);
  assert.equal(parseState({ ...initial(), stage: ["ready"] }), null);
});

test("rejects wrong field types", () => {
  assert.equal(parseState({ ...initial(), confirmed: "yes" }), null);
  assert.equal(parseState({ ...initial(), decisions: [] }), null);
  assert.equal(parseState({ ...initial(), decisions: null }), null);
  assert.equal(parseState({ ...initial(), choices: "x" }), null);
});

test("rejects unknown step ids and unknown decision values", () => {
  assert.equal(parseState({ ...initial(), decisions: { ghost: "accepted" } }), null);
  assert.equal(parseState({ ...initial(), decisions: { [stepId]: "maybe" } }), null);
  assert.equal(parseState({ ...initial(), decisions: { [stepId]: { x: 1 } } }), null);
  assert.equal(parseState({ ...initial(), choices: { ghost: true } }), null);
  assert.equal(parseState({ ...initial(), choices: { [optionalId]: "yes" } }), null);
});

test("rejects prototype keys parsed from JSON", () => {
  const polluted = JSON.parse('{"__proto__": {"admin": true}}');
  assert.equal(parseState({ ...initial(), decisions: polluted }), null);
  assert.equal(parseState({ ...initial(), choices: JSON.parse('{"constructor": true}') }), null);
  const fromJson = JSON.parse(
    `{"scenarioId":"${scenario.id}","stage":"whisper","confirmed":false,"decisions":{},"choices":{},"__proto__":{"x":1}}`,
  );
  const parsed = parseState(fromJson);
  assert.equal(Object.getPrototypeOf(parsed), Object.prototype);
  assert.equal(parsed.x, undefined);
});

test("rejects objects with a foreign prototype", () => {
  class Odd {}
  assert.equal(parseState(Object.assign(new Odd(), initial())), null);
});
