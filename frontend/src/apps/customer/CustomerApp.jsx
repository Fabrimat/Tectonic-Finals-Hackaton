import { useState } from "react";
import { scenarios, stages, stageOrder } from "../../data/scenarios";
import { useRipple } from "../../lib/store";
import ConfirmCard from "./ConfirmCard";
import RippleReveal from "./RippleReveal";
import StageTag from "./StageTag";
import InsightCard from "./InsightCard";
import HoldCard from "./HoldCard";
import PlanBoard from "./PlanBoard";
import SummaryBar from "./SummaryBar";
import "./customer.css";

export default function CustomerApp() {
  const { scenario, confirmed, decisions, actions } = useRipple();
  const [rippling, setRippling] = useState(false);
  const { person, stage } = scenario;
  const ready = stage === "ready";

  function confirm() {
    setRippling(true);
    actions.confirmSignal();
  }

  return (
    <div className="cx">
      <header className="cx-top">
        <span className="cx-wordmark">Ripple</span>
        <span className="cx-person">
          <span className="cx-person-name">{person.name}</span>
          <span className="cx-avatar" aria-hidden="true">
            {person.initials}
          </span>
        </span>
      </header>

      <div className="cx-switch">
        <label htmlFor="cx-scenario">Customer</label>
        <select id="cx-scenario" value={scenario.id} onChange={(e) => actions.selectScenario(e.target.value)}>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.person.name}
            </option>
          ))}
        </select>
      </div>
      <div className="cx-switch cx-demo" role="group" aria-label="Demo control, ladder stage">
        <span>Demo control, stage</span>
        {stageOrder.map((key) => (
          <button
            key={key}
            type="button"
            className={key === stage ? "cx-stage-btn is-active" : "cx-stage-btn"}
            aria-pressed={key === stage}
            onClick={() => actions.selectStage(key)}
          >
            {stages[key].label}
          </button>
        ))}
      </div>

      <main className="cx-main">
        <StageTag scenario={scenario} />
        {stage === "whisper" && <InsightCard scenario={scenario} />}
        {stage === "forming" && !confirmed && (
          <ConfirmCard scenario={scenario} onConfirm={actions.confirmSignal} onDecline={actions.declineSignal} />
        )}
        {stage === "forming" && confirmed && <HoldCard scenario={scenario} />}
        {ready && !confirmed && <ConfirmCard scenario={scenario} onConfirm={confirm} onDecline={actions.declineSignal} />}
        {ready && confirmed && rippling && <RippleReveal label={scenario.signal.question} onDone={() => setRippling(false)} />}
        {ready && confirmed && !rippling && <PlanBoard scenario={scenario} decisions={decisions} actions={actions} />}
      </main>

      {ready && confirmed && !rippling && <SummaryBar scenario={scenario} decisions={decisions} onReset={actions.reset} />}
    </div>
  );
}
