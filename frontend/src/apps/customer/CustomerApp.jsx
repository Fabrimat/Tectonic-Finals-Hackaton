import { useState } from "react";
import { useRipple } from "../../lib/store";
import ConfirmCard from "./ConfirmCard";
import RippleReveal from "./RippleReveal";
import PlanBoard from "./PlanBoard";
import SummaryBar from "./SummaryBar";
import "./customer.css";

export default function CustomerApp() {
  const { scenario, confirmed, decisions, actions } = useRipple();
  const [rippling, setRippling] = useState(false);
  const { person } = scenario;

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

      <main className="cx-main">
        {!confirmed && <ConfirmCard scenario={scenario} onConfirm={confirm} onDecline={actions.declineSignal} />}
        {confirmed && rippling && <RippleReveal label={scenario.signal.question} onDone={() => setRippling(false)} />}
        {confirmed && !rippling && <PlanBoard scenario={scenario} decisions={decisions} actions={actions} />}
      </main>

      {confirmed && !rippling && <SummaryBar scenario={scenario} decisions={decisions} onReset={actions.reset} />}
    </div>
  );
}
