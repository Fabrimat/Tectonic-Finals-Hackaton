import { scenarios, stageOrder } from "../data/scenarios.js";

export function initial() {
  return { scenarioId: scenarios[0].id, stage: stageOrder[0], confirmed: false, decisions: {} };
}

export function reduce(state, action) {
  switch (action.type) {
    case "selectScenario":
      return { scenarioId: action.scenarioId, stage: stageOrder[0], confirmed: false, decisions: {} };
    case "selectStage":
      return { ...state, stage: action.stage, confirmed: false, decisions: {} };
    case "confirmSignal":
      return { ...state, confirmed: true };
    case "declineSignal":
      return { ...state, confirmed: false, decisions: {} };
    case "decide":
      return { ...state, decisions: { ...state.decisions, [action.stepId]: action.decision } };
    case "clearDecision": {
      const { [action.stepId]: _removed, ...rest } = state.decisions;
      return { ...state, decisions: rest };
    }
    case "reset":
      return { ...initial(), scenarioId: state.scenarioId };
    default:
      return state;
  }
}
