import { scenarios, stageOrder } from "../data/scenarios.js";

export function initial() {
  return { scenarioId: scenarios[0].id, stage: stageOrder[0], confirmed: false, decisions: {}, choices: {} };
}

export function reduce(state, action) {
  switch (action.type) {
    case "selectScenario":
      return { scenarioId: action.scenarioId, stage: stageOrder[0], confirmed: false, decisions: {}, choices: {} };
    case "selectStage":
      return { ...state, stage: action.stage, confirmed: false, decisions: {}, choices: {} };
    case "confirmSignal":
      return { ...state, confirmed: true };
    case "declineSignal":
      return { ...state, confirmed: false, decisions: {}, choices: {} };
    case "decide":
      return { ...state, decisions: { ...state.decisions, [action.stepId]: action.decision } };
    case "clearDecision": {
      const { [action.stepId]: _removed, ...rest } = state.decisions;
      return { ...state, decisions: rest };
    }
    // Optional actions before a plan exists. They are remembered on this device only and never sent.
    case "choose":
      return { ...state, choices: { ...state.choices, [action.id]: true } };
    case "unchoose": {
      const { [action.id]: _gone, ...rest } = state.choices;
      return { ...state, choices: rest };
    }
    case "reset":
      return { ...initial(), scenarioId: state.scenarioId };
    default:
      return state;
  }
}
