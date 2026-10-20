import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { confidence, evidence, evidenceFor, reasonText } from "./evidence.js";

const file = new URL("../../../backend/data/scenarios.json", import.meta.url);
const missing = !existsSync(file);

test("score and signal labels match the backend cache", { skip: missing && "backend data not present" }, () => {
  for (const cached of JSON.parse(readFileSync(file, "utf8"))) {
    for (const [stage, plan] of Object.entries(cached.plans)) {
      const match = plan.matches[0];
      const local = evidenceFor(cached.id, stage);
      assert.ok(local, `${cached.id} ${stage}`);
      assert.equal(local.score, match.score);
      assert.equal(local.windowStage, match.windowStage);
      assert.deepEqual(
        local.signals.map((s) => [s.label, s.weight, s.contribution]),
        match.evidence.map((e) => [e.label, e.weight, e.contribution]),
      );
    }
  }
});

test("thresholds match the rules", { skip: !existsSync(new URL("../../../backend/data/rules.json", import.meta.url)) && "backend data not present" }, () => {
  const rules = JSON.parse(readFileSync(new URL("../../../backend/data/rules.json", import.meta.url), "utf8"));
  for (const rule of rules) assert.deepEqual(rule.confidence, confidence);
});

test("every demo suppressed entry is flagged", () => {
  const demos = [];
  for (const stages of Object.values(evidence))
    for (const entry of Object.values(stages)) for (const s of entry.suppressed) demos.push(s);
  assert.ok(demos.length > 0);
  assert.ok(demos.every((s) => s.demo === true));
});

test("unknown state and reason are handled", () => {
  assert.equal(evidenceFor("nope", "ready"), null);
  assert.equal(reasonText("other"), "held back");
});
