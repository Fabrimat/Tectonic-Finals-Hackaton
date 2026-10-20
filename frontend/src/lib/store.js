import { useSyncExternalStore } from "react";
import { scenarios } from "../data/scenarios";

const KEY = "ripple-state-v1";
const CHANNEL = "ripple-sync";

// One state object shared by the customer app and the partner portal.
// Both read it through useRipple(), and changes are mirrored across tabs
// so the partner screen updates while the customer taps on a phone-sized window.
//
// scenarioId: which scenario is active
// confirmed:  true once the customer confirms the detected signal
// decisions:  { [stepId]: "accepted" | "deferred" | "rejected" }
function initial() {
  return { scenarioId: scenarios[0].id, confirmed: false, decisions: {} };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial(), ...JSON.parse(raw) };
  } catch {
    // storage can be blocked, the in-memory state is enough
  }
  return initial();
}

let state = load();
const listeners = new Set();
let channel = null;
try {
  channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = (event) => {
    state = event.data;
    listeners.forEach((fn) => fn());
  };
} catch {
  channel = null;
}

function commit(next) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  channel?.postMessage(state);
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const actions = {
  selectScenario(scenarioId) {
    commit({ scenarioId, confirmed: false, decisions: {} });
  },
  confirmSignal() {
    commit({ ...state, confirmed: true });
  },
  declineSignal() {
    commit({ ...state, confirmed: false, decisions: {} });
  },
  decide(stepId, decision) {
    commit({ ...state, decisions: { ...state.decisions, [stepId]: decision } });
  },
  clearDecision(stepId) {
    const { [stepId]: _removed, ...rest } = state.decisions;
    commit({ ...state, decisions: rest });
  },
  reset() {
    commit({ ...initial(), scenarioId: state.scenarioId });
  },
};

export function useRipple() {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  const scenario = scenarios.find((s) => s.id === snapshot.scenarioId) ?? scenarios[0];
  return { ...snapshot, scenario, actions };
}
