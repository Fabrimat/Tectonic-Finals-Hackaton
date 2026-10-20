import { useState } from "react";
import { postIntent } from "../../lib/api";
import ConsentStrip from "./ConsentStrip";
import StepCard from "./StepCard";
import SkipCard from "./SkipCard";
import { areaNotes, stockLine } from "../../lib/area";
import { acceptAllActions, shownIds, startStep } from "./plan";

const syncText = {
  sent: "Request sent to the partner.",
  local: "Saved here. It is sent when the service is back.",
};

export default function PlanBoard({ scenario, decisions, actions }) {
  const steps = [...scenario.steps].sort((a, b) => a.order - b.order);
  const [sync, setSync] = useState("");
  const [expanded, setExpanded] = useState({});
  const [allOpen, setAllOpen] = useState(false);

  const decide = (step, decision) => {
    actions.decide(step.id, decision);
    if (decision === "accepted" && step.intent) postIntent(scenario.id, step).then(setSync);
  };

  const shown = shownIds(steps, decisions);
  const start = startStep(steps, decisions);
  const pending = acceptAllActions(steps, decisions);
  const main = steps.filter((s) => s.kind === "skip" || shown.has(s.id));
  const more = steps.filter((s) => s.kind !== "skip" && !shown.has(s.id));

  const acceptAll = () => {
    pending.forEach((a) => {
      const step = steps.find((s) => s.id === a.stepId);
      decide(step, a.decision);
    });
  };

  const card = (step) =>
    step.kind === "skip" ? (
      <SkipCard step={step} />
    ) : (
      <StepCard
        step={step}
        signal={scenario.signal}
        notes={areaNotes(scenario.area, step)}
        decision={decisions[step.id]}
        start={start?.id === step.id}
        onDecide={(d) => decide(step, d)}
        onUndo={() => actions.clearDecision(step.id)}
      />
    );

  return (
    <section aria-labelledby="cx-plan-title">
      <h1 id="cx-plan-title" className="cx-plan-title">
        Your plan
      </h1>
      <p className="cx-seen">{scenario.seen}</p>
      <ConsentStrip context="plan" />
      {stockLine(scenario.area) && (
        <details className="cx-more cx-plain-more">
          <summary>About your area</summary>
          <p className="cx-muted">{stockLine(scenario.area)}</p>
        </details>
      )}
      {pending.length > 0 && (
        <button type="button" className="cx-btn cx-btn-primary cx-accept-all" onClick={acceptAll}>
          Accept all recommended
        </button>
      )}
      <ol className="cx-steps">
        {main.map((step) => (
          <li key={step.id}>{card(step)}</li>
        ))}
      </ol>
      {more.length > 0 && (
        <>
          <ol className="cx-steps cx-steps-more">
            {more.map((step) => {
              const open = allOpen || expanded[step.id];
              return (
                <li key={step.id}>
                  {open ? (
                    card(step)
                  ) : (
                    <button
                      type="button"
                      className="cx-row"
                      aria-expanded="false"
                      onClick={() => setExpanded({ ...expanded, [step.id]: true })}
                    >
                      <span className="cx-row-title">{step.title}</span>
                      <span className="cx-chevron" aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
          {!allOpen && (
            <button type="button" className="cx-btn cx-btn-outline cx-show-more" onClick={() => setAllOpen(true)}>
              Show {more.length} more {more.length === 1 ? "step" : "steps"}
            </button>
          )}
        </>
      )}
      {syncText[sync] && (
        <p className="cx-sync" role="status">
          {syncText[sync]}
        </p>
      )}
    </section>
  );
}
