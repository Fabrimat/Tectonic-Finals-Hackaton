// Which plan steps are recommended, which start the plan, and which show on first view.
export const VISIBLE_STEPS = 3;

const byOrder = (a, b) => a.order - b.order;

// A step the customer can act on that is not a proposed partner and not a "not needed" card.
export function recommendedSteps(steps) {
  return steps.filter((s) => s.kind === "action" && !s.partner?.proposed).sort(byOrder);
}

// The one step marked "Start here": the first recommended step still undecided.
export function startStep(steps, decisions = {}) {
  return recommendedSteps(steps).find((s) => !decisions[s.id]) ?? null;
}

// Ids shown in full by default. Everything else collapses to a one line row.
export function shownIds(steps, decisions = {}) {
  const ids = new Set(recommendedSteps(steps).slice(0, VISIBLE_STEPS).map((s) => s.id));
  steps.forEach((s) => {
    if (s.kind === "action" && decisions[s.id]) ids.add(s.id);
  });
  return ids;
}

// The same decide actions a tap on each Accept button would dispatch, for steps not yet decided.
export function acceptAllActions(steps, decisions = {}) {
  return recommendedSteps(steps)
    .filter((s) => !decisions[s.id])
    .map((s) => ({ type: "decide", stepId: s.id, decision: "accepted" }));
}

// The progress card on the home screen: how many steps are accepted and what they save a year.
// Only for the ready stage and once at least one step is accepted, otherwise null.
export function planProgress(scenario, decisions = {}) {
  if (scenario.stage !== "ready") return null;
  const accepted = scenario.steps.filter((s) => s.kind === "action" && decisions[s.id] === "accepted");
  if (accepted.length === 0) return null;
  return { accepted: accepted.length, saved: accepted.reduce((sum, s) => sum + s.saving, 0) };
}
