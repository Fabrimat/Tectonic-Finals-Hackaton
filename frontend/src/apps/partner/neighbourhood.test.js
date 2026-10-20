import assert from "node:assert/strict";
import test from "node:test";
import { MIN_GROUP_SIZE, neighbourhoodView, propose, withheldCount } from "./neighbourhood.js";
import data from "../../data/neighbourhood.json" with { type: "json" };

const cohort = (count, id = `c${count}`) => ({ id, segment: "household", place: "9000 Gent", builtFrom: 1955, builtTo: 1970, label: "E", window: 2027, intent: "Renovation", count });

test("the minimum group size is five", () => {
  assert.equal(MIN_GROUP_SIZE, 5);
});

test("4 is hidden, 5 and 6 are shown", () => {
  const view = neighbourhoodView([cohort(4), cohort(5), cohort(6)]);
  assert.deepEqual(view.groups.map((g) => g.id), ["c5", "c6"]);
  assert.equal(view.hiddenGroups, 1);
});

test("the view model holds text only, no counts of hidden rows or identifiers", () => {
  const view = neighbourhoodView([cohort(4), cohort(7)]);
  assert.deepEqual(Object.keys(view.groups[0]).sort(), ["id", "intent", "text"]);
  assert.ok(!JSON.stringify(view).includes('"count"'));
});

test("the household view shows the Gent group and hides the small one", () => {
  const view = neighbourhoodView(undefined, undefined, "household");
  assert.ok(view.groups.some((g) => g.text === "12 homes in 9000 Gent, built 1955 to 1970, label E, window 2027"));
  assert.ok(!JSON.stringify(view).includes("Mechelen"));
  assert.equal(view.hiddenGroups, 1);
});

test("the trade street cohort is a business group", () => {
  const view = neighbourhoodView(undefined, undefined, "business");
  assert.equal(view.groups[0].text, "9 shops in Naamsestraat, Leuven, older buildings, window 2027");
});

test("the demo action is local state only and sends nothing", () => {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = (...args) => (calls.push(args), Promise.resolve());
  try {
    const next = propose({}, "gent-9000-e");
    assert.deepEqual(next, { "gent-9000-e": "Samen Overstappen" });
    assert.equal(calls.length, 0);
  } finally {
    globalThis.fetch = original;
  }
});

test("withheld adds the evidence count and the not needed steps", () => {
  const scenario = { id: "x", steps: [{ kind: "skip" }, { kind: "action" }, { kind: "skip" }] };
  assert.equal(withheldCount(scenario, { x: 3 }), 5);
  assert.equal(withheldCount(scenario, {}), 2);
});

test("the data keeps one cohort below the minimum", () => {
  assert.ok(data.cohorts.some((c) => c.count < MIN_GROUP_SIZE));
});
