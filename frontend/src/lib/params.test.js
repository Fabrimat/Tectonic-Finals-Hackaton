import assert from "node:assert/strict";
import test from "node:test";
import { stateFromParams, viewParams } from "./params.js";

test("no parameters means no preset", () => {
  assert.equal(stateFromParams(""), null);
  assert.equal(stateFromParams("?unknown=1"), null);
});

test("scenario and stage open that state, unconfirmed", () => {
  const s = stateFromParams("?scenario=bakery-leuven&stage=forming");
  assert.equal(s.scenarioId, "bakery-leuven");
  assert.equal(s.stage, "forming");
  assert.equal(s.confirmed, false);
  assert.deepEqual(s.decisions, {});
});

test("confirmed=1 confirms the signal", () => {
  assert.equal(stateFromParams("?scenario=household-maes&stage=ready&confirmed=1").confirmed, true);
  assert.equal(stateFromParams("?stage=ready&confirmed=0")?.confirmed, false);
});

test("accepted=N takes the first N action steps in plan order and confirms", () => {
  const s = stateFromParams("?scenario=household-maes&stage=ready&accepted=3");
  assert.deepEqual(s.decisions, { epc: "accepted", estimate: "accepted", insulation: "accepted" });
  assert.equal(s.confirmed, true);
});

test("accepted, deferred and rejected lists keep valid ids only and the first wish wins", () => {
  const s = stateFromParams("?scenario=household-maes&stage=ready&accepted=epc,nope,battery&deferred=heating,epc&rejected=solar");
  assert.deepEqual(s.decisions, { epc: "accepted", heating: "deferred", solar: "rejected" });
});

test("unknown scenario and stage fall back safely", () => {
  const s = stateFromParams("?scenario=nobody&stage=later&confirmed=1");
  assert.equal(s.scenarioId, "household-maes");
  assert.equal(s.stage, "whisper");
  assert.equal(s.confirmed, true);
});

test("decisions are ignored for stages without steps", () => {
  const s = stateFromParams("?stage=whisper&accepted=3");
  assert.deepEqual(s.decisions, {});
  assert.equal(s.confirmed, false);
});

test("view parameters read the partner and the tools switch", () => {
  assert.deepEqual(viewParams("?partner=Setle&tools=0"), { partner: "Setle", tools: false, open: false, cluster: false });
  assert.deepEqual(viewParams(""), { partner: "", tools: true, open: false, cluster: false });
  assert.equal(viewParams("?cluster=1").cluster, true);
});

test("the partner parameter accepts all and known partners only", () => {
  assert.equal(viewParams("?partner=all").partner, "all");
  assert.equal(viewParams("?partner=Samen%20Overstappen").partner, "Samen Overstappen");
  assert.equal(viewParams("?partner=Nobody").partner, "");
});
