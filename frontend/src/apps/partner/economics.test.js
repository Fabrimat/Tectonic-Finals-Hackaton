import assert from "node:assert/strict";
import test from "node:test";
import { scenarios, viewOf } from "../../data/scenarios.js";
import { acceptedSteps, assumptions, commissionEstimate, decisionCounts, defaultDecisions, eur, kbcEstimate, productEstimate, retentionEstimate } from "./economics.js";
import { leadsFor } from "./leadData.js";

const lead = (partner, band) => ({ partner, band });
const readySteps = scenarios.flatMap((base) => viewOf(base, "ready").steps);

test("every KBC product points at a plan step that KBC delivers itself", () => {
  for (const product of assumptions.kbcProducts) {
    for (const id of product.stepIds) {
      const step = readySteps.find((s) => s.id === id);
      assert.ok(step, id);
      assert.equal(step.partner, null, id);
    }
  }
});

test("every partner with a commission rate exists in the plans and rates are shares", () => {
  const names = new Set(readySteps.filter((s) => s.partner).map((s) => s.partner.name));
  for (const [name, rate] of Object.entries(assumptions.commission)) {
    assert.ok(names.has(name), name);
    assert.ok(rate > 0 && rate < 1, name);
  }
});

test("product value is count times conversion times first year value, and nothing without accepted steps", () => {
  const loan = assumptions.kbcProducts.find((p) => p.id === "energy-loan");
  const r = productEstimate(["energy-loan", "epc"]);
  assert.equal(r.items.length, 1);
  assert.equal(r.total, loan.conversion * loan.value);
  assert.deepEqual(productEstimate([]), { items: [], total: 0 });
});

test("products add up across the accepted KBC steps", () => {
  const r = productEstimate(["energy-loan", "home-insurance"]);
  assert.equal(r.items.length, 2);
  assert.equal(r.total, r.items[0].expected + r.items[1].expected);
});

test("commission is paid only by partners with a rate, other partners still count as leads", () => {
  const r = commissionEstimate([lead("Samen Overstappen", "A"), lead("Setle", "A"), lead("Setle", "B")]);
  const signed = assumptions.partnerLeads.leadValue.A * assumptions.partnerLeads.conversion;
  assert.equal(r.total, signed * assumptions.commission["Samen Overstappen"]);
  assert.equal(r.partnersWithRate, 1);
  assert.equal(r.partnersWithout, 1);
  assert.equal(r.items.find((i) => i.partner === "Setle").leads, 2);
});

test("retention only counts from the minimum number of accepted steps", () => {
  const { minSteps, share, years, marginPerYear } = assumptions.retention;
  assert.deepEqual(retentionEstimate(minSteps - 1), { eligible: false, amount: 0 });
  assert.deepEqual(retentionEstimate(minSteps), { eligible: true, amount: share * years * marginPerYear });
});

test("KBC own value leads and excludes commission, the total adds it", () => {
  const r = kbcEstimate({
    acceptedIds: ["energy-loan", "home-insurance", "insulation"],
    leads: [lead("Impact us today", "C")],
  });
  assert.equal(r.own, r.products.total + r.retention.amount);
  assert.ok(r.commission.total > 0);
  assert.equal(r.all, r.own + r.commission.total);
});

test("nothing accepted gives zero everywhere", () => {
  const r = kbcEstimate({ acceptedIds: [], leads: [] });
  assert.equal(r.own, 0);
  assert.equal(r.all, 0);
});

test("eur formats with a prefix and at most two decimals", () => {
  assert.equal(eur(1234.567), "EUR 1,234.57");
  assert.equal(eur(0), "EUR 0");
});

const household = scenarios.find((s) => s.id === "household-maes");
const householdView = viewOf(household, "ready");

test("the default decisions exist for every scenario and name real action steps", () => {
  for (const base of scenarios) {
    const view = viewOf(base, "ready");
    const decisions = defaultDecisions(base.id);
    const actions = view.steps.filter((s) => s.kind === "action").map((s) => s.id);
    assert.ok(Object.keys(decisions).length > 0, base.id);
    for (const id of Object.keys(decisions)) assert.ok(actions.includes(id), id);
    const values = new Set(Object.values(decisions));
    assert.deepEqual([...values].sort(), ["accepted", "deferred", "rejected"]);
  }
});

test("household defaults match the decided plan example", () => {
  assert.deepEqual(defaultDecisions("household-maes"), {
    epc: "accepted",
    estimate: "accepted",
    insulation: "accepted",
    heating: "deferred",
    solar: "rejected",
  });
});

test("deferred and rejected steps count for nothing", () => {
  const decisions = { epc: "accepted", "energy-loan": "deferred", "home-insurance": "rejected" };
  const ids = acceptedSteps(householdView.steps, decisions).map((s) => s.id);
  assert.deepEqual(ids, ["epc"]);
  const kbc = kbcEstimate({ acceptedIds: ids, leads: [] });
  assert.equal(kbc.products.total, 0);
  assert.equal(kbc.own, 0);
});

test("only accepted steps produce leads and product value", () => {
  const decisions = { epc: "accepted", heating: "deferred", solar: "rejected", "energy-loan": "accepted" };
  const leads = leadsFor(householdView, decisions, true);
  assert.deepEqual(leads.map((l) => l.id), ["epc"]);
  const none = { heating: "deferred", solar: "rejected", "energy-loan": "deferred" };
  assert.deepEqual(leadsFor(householdView, none, true), []);
  assert.equal(kbcEstimate({ acceptedIds: acceptedSteps(householdView.steps, none).map((s) => s.id), leads: [] }).all, 0);
});

test("decision counts split accepted, deferred, rejected and open", () => {
  const counts = decisionCounts(householdView.steps, defaultDecisions("household-maes"));
  assert.deepEqual(counts, { accepted: 3, deferred: 1, rejected: 1, open: 3 });
});
