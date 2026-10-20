import assert from "node:assert/strict";
import test from "node:test";
import { assumptions, eur, kbcEstimate } from "./economics.js";

const lead = (band) => ({ band });

test("signed value is band value times conversion, commission is a share of it", () => {
  const r = kbcEstimate([lead("A"), lead("C")], 0);
  const expected = (assumptions.leadValue.A + assumptions.leadValue.C) * assumptions.conversion;
  assert.equal(r.signedValue, expected);
  assert.equal(r.commission, expected * assumptions.commission);
});

test("retention only counts from the minimum number of accepted steps", () => {
  const below = kbcEstimate([], assumptions.retentionMinSteps - 1);
  const at = kbcEstimate([], assumptions.retentionMinSteps);
  assert.equal(below.eligible, false);
  assert.equal(below.retention, 0);
  assert.equal(at.eligible, true);
  assert.equal(at.retention, assumptions.retentionShare * assumptions.retentionYears * assumptions.marginPerYear);
});

test("total adds commission and retention", () => {
  const r = kbcEstimate([lead("B")], assumptions.retentionMinSteps);
  assert.equal(r.total, r.commission + r.retention);
});

test("no leads and no steps gives zero", () => {
  assert.equal(kbcEstimate([], 0).total, 0);
});

test("eur formats with a prefix and at most two decimals", () => {
  assert.equal(eur(1234.567), "EUR 1,234.57");
  assert.equal(eur(0), "EUR 0");
});
