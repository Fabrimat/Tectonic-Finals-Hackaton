import assert from "node:assert/strict";
import test from "node:test";
import { canShare, scenarios, viewOf } from "../../data/scenarios.js";
import { allPartners, leadsFor, leadsFromIntents, partnersOf, reference } from "./leadData.js";

const base = scenarios[0];
const ready = viewOf(base, "ready");
const shareable = ready.steps.filter((s) => s.partner && s.intent);

test("the fixture has partner steps to work with", () => {
  assert.ok(shareable.length >= 2);
});

test("only the ready stage can share", () => {
  assert.equal(canShare(viewOf(base, "whisper")), false);
  assert.equal(canShare(viewOf(base, "forming")), false);
  assert.equal(canShare(ready), true);
});

test("no leads before the customer confirms the signal", () => {
  const decisions = { [shareable[0].id]: "accepted" };
  assert.deepEqual(leadsFor(ready, decisions, false), []);
});

test("no leads outside the ready stage even when decisions exist", () => {
  const decisions = { [shareable[0].id]: "accepted" };
  assert.deepEqual(leadsFor(viewOf(base, "forming"), decisions, true), []);
  assert.deepEqual(partnersOf(viewOf(base, "forming")), []);
});

test("only accepted steps become leads", () => {
  const decisions = { [shareable[0].id]: "accepted", [shareable[1].id]: "deferred" };
  const leads = leadsFor(ready, decisions, true);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].id, shareable[0].id);
  assert.equal(leads[0].partner, shareable[0].partner.name);
});

test("a lead carries intent fields only, nothing about the person", () => {
  const leads = leadsFor(ready, { [shareable[0].id]: "accepted" }, true);
  assert.deepEqual(Object.keys(leads[0]).sort(), ["band", "id", "partner", "ref", "region", "service", "timeframe"]);
  assert.ok(!JSON.stringify(leads).includes(base.person.name));
});

test("references are stable and unique per step", () => {
  assert.equal(reference("s", "a"), reference("s", "a"));
  assert.notEqual(reference("s", "a"), reference("s", "b"));
  assert.match(reference("s", "a"), /^LD-[0-9A-F]{4}$/);
});

test("partnersOf lists each partner once", () => {
  const names = partnersOf(ready).map((p) => p.name);
  assert.equal(new Set(names).size, names.length);
});

test("allPartners covers every scenario", () => {
  const names = allPartners().map((p) => p.name);
  for (const s of scenarios) {
    for (const step of viewOf(s, "ready").steps) {
      if (step.partner && step.intent) assert.ok(names.includes(step.partner.name));
    }
  }
});

test("server intents map to partner leads and unknown steps are dropped", () => {
  const step = shareable[0];
  const row = { service: "S", region: "R", timeframe: "T", budgetBand: "B" };
  const intents = [
    { reference: "LD-AAAA", scenarioId: base.id, stepId: step.id, ...row },
    { reference: "LD-BBBB", scenarioId: base.id, stepId: "no-such-step", ...row },
    { reference: "LD-CCCC", scenarioId: "no-such-scenario", stepId: step.id, ...row },
  ];
  const leads = leadsFromIntents(intents);
  assert.equal(leads.length, 1);
  assert.deepEqual(leads[0], {
    id: step.id,
    ref: "LD-AAAA",
    partner: step.partner.name,
    service: "S",
    region: "R",
    timeframe: "T",
    band: "B",
  });
});
