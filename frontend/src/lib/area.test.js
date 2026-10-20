import assert from "node:assert/strict";
import test from "node:test";
import { groupRounds } from "../data/groupRounds.js";
import { scenarios, viewOf } from "../data/scenarios.js";
import { areaNotes, stockLine } from "./area.js";

const stepsOf = (base) => viewOf(base, "ready").steps;
const household = scenarios.find((s) => s.segment === "household");
const business = scenarios.find((s) => s.segment === "business");

test("a historic centre adds a note to insulation and solar, and not to other steps", () => {
  const insulation = stepsOf(household).find((s) => s.id === "insulation");
  const loan = stepsOf(household).find((s) => s.id === "energy-loan");
  assert.equal(household.area.historicCentre, true);
  assert.equal(areaNotes(household.area, insulation).length, 1);
  assert.deepEqual(areaNotes(household.area, loan), []);
});

test("no historic note when the home is not in a historic centre", () => {
  const solar = stepsOf(business).find((s) => s.id === "solar");
  assert.equal(business.area.historicCentre, false);
  assert.deepEqual(areaNotes(business.area, solar), []);
});

test("an open group round matching the step service is pointed out", () => {
  const solar = stepsOf(household).find((s) => s.id === "solar");
  const notes = areaNotes(household.area, solar);
  assert.ok(notes.some((n) => n.includes("group round is open")));
});

test("a round that is not listed as open for the area is ignored", () => {
  const solar = stepsOf(household).find((s) => s.id === "solar");
  const area = { ...household.area, openGroupRounds: [] };
  assert.ok(!areaNotes(area, solar).some((n) => n.includes("group round")));
});

test("every open round id in the scenarios exists in the rounds list", () => {
  const ids = new Set(groupRounds.map((r) => r.id));
  for (const base of scenarios) for (const id of base.area.openGroupRounds) assert.ok(ids.has(id), id);
});

test("stockLine is empty without data and states the age otherwise", () => {
  assert.equal(stockLine(null), "");
  assert.match(stockLine({ buildingStockAge: 60 }), /60 years/);
});
