import { stages } from "../../data/scenarios";

export default function StageTag({ scenario }) {
  const stage = stages[scenario.stage];
  return (
    <p className={`cx-stage cx-stage-${scenario.stage}`}>
      <span className="cx-stage-label">{stage.label}</span>
      <span className="cx-stage-window">
        About {scenario.monthsAhead} months ahead, window {scenario.window}
      </span>
    </p>
  );
}
