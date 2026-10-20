import { useSyncExternalStore } from "react";
import { scenarios, viewOf } from "../data/scenarios.js";
import { forgetSent } from "./api.js";
import { deepLinkState } from "./params.js";
import { initial, reduce } from "./reducer.js";
import { parseState } from "./validate.js";

const KEY = "ripple-state-v3";
const CHANNEL = "ripple-sync";

// One state object shared by the customer app and the partner portal, mirrored across tabs.
// The state shape and transitions live in reducer.js.
//
// scenarioId: which scenario is active
// stage:      which rung of the intent ladder is shown (a demo control)
// confirmed:  true once the customer confirms the detected signal
// decisions:  { [stepId]: "accepted" | "deferred" | "rejected" }
// choices:    { [actionId]: true } optional actions chosen before a plan, local only

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return parseState(JSON.parse(raw)) ?? initial();
  } catch {
    // storage can be blocked, the in-memory state is enough
  }
  return initial();
}

// A deep link state is shown without being saved or sent to other tabs until the user acts.
let state = deepLinkState ?? load();
let pinned = deepLinkState !== null;
const listeners = new Set();
let channel = null;
try {
  channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = (event) => {
    if (pinned) return;
    const next = parseState(event.data);
    if (!next) return;
    state = next;
    listeners.forEach((fn) => fn());
  };
} catch {
  channel = null;
}

function commit(next) {
  pinned = false;
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
  declineSignal: () => {
    forgetSent();
    commit(reduce(state, { type: "declineSignal" }));
  },
  decide: (stepId, decision) => commit(reduce(state, { type: "decide", stepId, decision })),
  clearDecision: (stepId) => commit(reduce(state, { type: "clearDecision", stepId })),
  choose: (id) => commit(reduce(state, { type: "choose", id })),
  unchoose: (id) => commit(reduce(state, { type: "unchoose", id })),
  reset: () => {
    forgetSent();
    commit(reduce(state, { type: "reset" }));
  },
};

export const getState = () => state;

export function useRipple() {
  const snapshot = useSyncExternalStore(subscribe, () => state);
  const base = scenarios.find((s) => s.id === snapshot.scenarioId) ?? scenarios[0];
  const scenario = viewOf(base, snapshot.stage);
  return { ...snapshot, scenario, actions };
}
