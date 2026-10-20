import { scenarios, stageOrder, viewOf } from "../data/scenarios.js";
import { roles } from "../data/partners.js";
import { initial } from "./reducer.js";

// URL parameters that open a state directly, for screenshots and for sharing a view.
//   scenario   scenario id
//   stage      whisper, forming or ready
//   confirmed  1 once the signal is confirmed
//   accepted   a number N (the first N steps) or a comma separated list of step ids
//   deferred   comma separated step ids
//   rejected   comma separated step ids
//   partner    partner name shown first on the advisor dashboard, or all; unknown names are ignored
//   cluster    1 shows only the neighbourhood groups card on the advisor dashboard
//   tools      0 hides the demo tools
//   clock      1 shows the renovation clock alone on the home screen, without the feed cards
//   open       1 opens the energy radar card instead of the home screen
//   sheet      1 opens the What partners see sheet; only with open=1 and at least one accepted step
// Unknown values are ignored. Any decision implies a confirmed signal.

const truthy = (value) => value === "1" || value === "true";

function decisionIds(value, actionIds) {
  if (!value) return [];
  if (/^\d+$/.test(value)) return actionIds.slice(0, Number(value));
  return value.split(",").filter((id) => actionIds.includes(id));
}

// Returns a full state for the parameters, or null when none of them apply.
export function stateFromParams(search) {
  const params = new URLSearchParams(search);
  const base = scenarios.find((s) => s.id === params.get("scenario"));
  const stageParam = params.get("stage");
  const stage = stageOrder.includes(stageParam) ? stageParam : null;
  const decisions = { accepted: params.get("accepted"), deferred: params.get("deferred"), rejected: params.get("rejected") };
  const wanted = Object.values(decisions).some(Boolean);
  if (!base && !stage && !wanted && !truthy(params.get("confirmed"))) return null;

  const state = initial();
  const scenario = base ?? scenarios.find((s) => s.id === state.scenarioId);
  state.scenarioId = scenario.id;
  state.stage = stage ?? stageOrder[0];
  const actionIds = viewOf(scenario, state.stage)
    .steps.filter((s) => s.kind === "action")
    .sort((a, b) => a.order - b.order)
    .map((s) => s.id);
  for (const key of ["accepted", "deferred", "rejected"]) {
    for (const id of decisionIds(decisions[key], actionIds)) state.decisions[id] ??= key;
  }
  state.confirmed = truthy(params.get("confirmed")) || Object.keys(state.decisions).length > 0;
  return state;
}

const partnerNames = roles.flatMap((r) => r.partners.map((p) => p.name));

export function viewParams(search) {
  const params = new URLSearchParams(search);
  const partner = params.get("partner") ?? "";
  return {
    partner: partner === "all" || partnerNames.includes(partner) ? partner : "",
    tools: params.get("tools") !== "0",
    open: truthy(params.get("open")),
    clock: truthy(params.get("clock")),
    cluster: truthy(params.get("cluster")),
    evidence: truthy(params.get("open")) && truthy(params.get("evidence")),
    sheet: truthy(params.get("open")) && truthy(params.get("sheet")),
  };
}

export const view = viewParams(typeof window === "undefined" ? "" : window.location.search);
export const deepLinkState = stateFromParams(typeof window === "undefined" ? "" : window.location.search);
