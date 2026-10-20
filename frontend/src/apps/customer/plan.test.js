import assert from "node:assert/strict";
import test from "node:test";
import { scenarios, viewOf } from "../../data/scenarios.js";
import { initial, reduce } from "../../lib/reducer.js";
import { acceptAllActions, planProgress, recommendedSteps, shownIds, startStep } from "./plan.js";

const ready = scenarios.map((s) => viewOf(s, "ready"));

test("recommended steps are actions without a proposed partner", () => {
  for (const view of ready) {
    const list = recommendedSteps(view.steps);
    assert.ok(list.length > 0);
    assert.ok(list.every((s) => s.kind === "action" && !s.partner?.proposed));
    assert.deepEqual(list, [...list].sort((a, b) => a.order - b.order));
  }
});

test("start here is the first recommended step that is undecided", () => {
  const view = ready[0];
  const list = recommendedSteps(view.steps);
  assert.equal(startStep(view.steps).id, list[0].id);
  assert.equal(startStep(view.steps, { [list[0].id]: "accepted" }).id, list[1].id);
  const all = Object.fromEntries(list.map((s) => [s.id, "deferred"]));
  assert.equal(startStep(view.steps, all), null);
});

test("only a few steps show by default and decided ones stay shown", () => {
  const view = ready[0];
  const list = recommendedSteps(view.steps);
  assert.equal(shownIds(view.steps).size, 3);
  assert.ok(shownIds(view.steps, { [list[4].id]: "rejected" }).has(list[4].id));
});

test("accept all recommended dispatches one accept per recommended step", () => {
  const view = ready[0];
  const actions = acceptAllActions(view.steps);
  assert.deepEqual(
    actions.map((a) => a.stepId),
    recommendedSteps(view.steps).map((s) => s.id),
  );
  let state = reduce(initial(), { type: "confirmSignal" });
  for (const a of actions) state = reduce(state, a);
  for (const s of recommendedSteps(view.steps)) assert.equal(state.decisions[s.id], "accepted");
  const rest = view.steps.filter((s) => !recommendedSteps(view.steps).includes(s));
  for (const s of rest) assert.equal(state.decisions[s.id], undefined);
});

test("accept all leaves earlier choices alone", () => {
  const view = ready[0];
  const first = recommendedSteps(view.steps)[0];
  const actions = acceptAllActions(view.steps, { [first.id]: "rejected" });
  assert.ok(!actions.some((a) => a.stepId === first.id));
});

test("plan progress counts accepted steps and sums their saving, ready stage only", () => {
  const view = ready.find((v) => v.id === "household-maes");
  const accepted = recommendedSteps(view.steps).slice(0, 3);
  const decisions = Object.fromEntries(accepted.map((s) => [s.id, "accepted"]));
  const progress = planProgress(view, decisions);
  assert.equal(progress.accepted, 3);
  assert.equal(progress.saved, accepted.reduce((sum, s) => sum + s.saving, 0));
  assert.equal(planProgress(view, {}), null);
  assert.equal(planProgress(view, { [accepted[0].id]: "deferred" }), null);
  assert.equal(planProgress({ ...view, stage: "forming" }, decisions), null);
});
