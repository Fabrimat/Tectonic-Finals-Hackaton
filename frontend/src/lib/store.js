import { useSyncExternalStore } from "react";
import { scenarios, viewOf } from "../data/scenarios";
import { initial, reduce } from "./reducer";

const KEY = "ripple-state-v2";
const CHANNEL = "ripple-sync";

// One state object shared by the customer app and the partner portal.
// Both read it through useRipple(), and changes are mirrored across tabs
// so the partner screen updates while the customer taps on a phone-sized window.
// The state shape and transitions live in reducer.js.
//
// scenarioId: which scenario is active
// stage:      which rung of the intent ladder is shown (a demo control)
// confirmed:  true once the customer confirms the detected signal
// decisions:  { [stepId]: "accepted" | "deferred" | "rejected" }

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
  selectScenario: (scenarioId) => commit(reduce(state, { type: "selectScenario", scenarioId })),
  selectStage: (stage) => commit(reduce(state, { type: "selectStage", stage })),
  confirmSignal: () => commit(reduce(state, { type: "confirmSignal" })),
  declineSignal: () => commit(reduce(state, { type: "declineSignal" })),
  decide: (stepId, decision) => commit(reduce(state, { type: "decide", stepId, decision })),
  clearDecision: (stepId) => commit(reduce(state, { type: "clearDecision", stepId })),
  reset: () => commit(reduce(state, { type: "reset" })),
};

export function useRipple() {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  const base = scenarios.find((s) => s.id === snapshot.scenarioId) ?? scenarios[0];
  const scenario = viewOf(base, snapshot.stage);
  return { ...snapshot, scenario, actions };
}
