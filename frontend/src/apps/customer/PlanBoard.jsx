import { useState } from "react";
import { postIntent } from "../../lib/api";
import StepCard from "./StepCard";
import SkipCard from "./SkipCard";
import { areaNotes, stockLine } from "../../lib/area";

const syncText = {
  sent: "Your request reached the partner.",
  local: "Saved on this device. It will not reach the partner until the service is back.",
};

export default function PlanBoard({ scenario, decisions, actions }) {
  const steps = [...scenario.steps].sort((a, b) => a.order - b.order);
  const [sync, setSync] = useState("");

  const decide = (step, decision) => {
    actions.decide(step.id, decision);
    if (decision === "accepted" && step.intent) postIntent(scenario.id, step).then(setSync);
  };

  return (
    <section aria-labelledby="cx-plan-title">
      <h1 id="cx-plan-title" className="cx-plan-title">
        Your plan
      </h1>
      <p className="cx-seen">{scenario.seen}</p>
      {stockLine(scenario.area) && <p className="cx-muted">{stockLine(scenario.area)}</p>}
      <ol className="cx-steps">
        {steps.map((step) => (
          <li key={step.id}>
            {step.kind === "skip" ? (
              <SkipCard step={step} />
            ) : (
              <StepCard
                step={step}
                signal={scenario.signal}
                notes={areaNotes(scenario.area, step)}
                decision={decisions[step.id]}
                onDecide={(d) => decide(step, d)}
                onUndo={() => actions.clearDecision(step.id)}
              />
            )}
          </li>
        ))}
      </ol>
      {syncText[sync] && (
        <p className="cx-sync" role="status">
          {syncText[sync]}
        </p>
      )}
    </section>
  );
}
