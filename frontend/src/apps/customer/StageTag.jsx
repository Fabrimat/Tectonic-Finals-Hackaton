import { stages } from "../../data/scenarios";
import { monthsLabel } from "./format";

export default function StageTag({ scenario }) {
  const stage = stages[scenario.stage];
  return (
    <p className={`cx-stage cx-stage-${scenario.stage}`}>
      <span className="cx-stage-label">{stage.label}</span>
      <span className="cx-stage-window">Likely in {monthsLabel(scenario.monthsAhead)}</span>
    </p>
  );
}
