import StepCard from "./StepCard";
import SkipCard from "./SkipCard";

export default function PlanBoard({ scenario, decisions, actions }) {
  const steps = [...scenario.steps].sort((a, b) => a.order - b.order);

  return (
    <section aria-labelledby="cx-plan-title">
      <h1 id="cx-plan-title" className="cx-plan-title">
        Your plan
      </h1>
      <p className="cx-seen">{scenario.seen}</p>
      <ol className="cx-steps">
        {steps.map((step) => (
          <li key={step.id}>
            {step.kind === "skip" ? (
              <SkipCard step={step} />
            ) : (
              <StepCard
                step={step}
                signal={scenario.signal}
                decision={decisions[step.id]}
                onDecide={(d) => actions.decide(step.id, d)}
                onUndo={() => actions.clearDecision(step.id)}
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
