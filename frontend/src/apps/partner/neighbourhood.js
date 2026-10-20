import data from "../../data/neighbourhood.json" with { type: "json" };

// A cohort is shown only when it holds at least this many homes or shops.
export const MIN_GROUP_SIZE = 5;

export const GROUP_PARTNER = "Samen Overstappen";

function describe(c) {
  const years = c.builtFrom === c.builtTo ? `${c.builtFrom}` : `${c.builtFrom} to ${c.builtTo}`;
  if (c.kind === "shops") {
    return `${c.count} shops in ${c.place}, ${c.label}, window ${c.window}`;
  }
  return `${c.count} homes in ${c.place}, built ${years}, label ${c.label}, window ${c.window}`;
}

// The view model carries only what the card prints. Nothing below the minimum is included
// except a bare count of hidden groups.
export function neighbourhoodView(cohorts = data.cohorts, min = MIN_GROUP_SIZE, segment = null) {
  const pool = segment ? cohorts.filter((c) => c.segment === segment) : cohorts;
  const shown = pool.filter((c) => c.count >= min);
  return {
    min,
    groups: shown.map((c) => ({ id: c.id, text: describe(c), intent: c.intent })),
    hiddenGroups: pool.length - shown.length,
  };
}

// Local only: marks a group as proposed. Nothing leaves the device.
export const propose = (proposed, id) => ({ ...proposed, [id]: GROUP_PARTNER });

// Recommendations held back: suppressed by evidence plus the not needed cards of the plan.
export function withheldCount(scenario, table = data.withheldByScenario) {
  return (table[scenario.id] ?? 0) + scenario.steps.filter((s) => s.kind === "skip").length;
}
