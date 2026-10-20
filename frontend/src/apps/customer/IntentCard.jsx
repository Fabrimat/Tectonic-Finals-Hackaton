import Icon from "./icons";

function summary(scenario, confirmed, decisions) {
  const { stage } = scenario;
  if (stage === "whisper") {
    return { icon: "radar", kicker: "Energy radar", text: scenario.insight.title, cta: "Read more", quiet: true };
  }
  if (stage === "forming") {
    return confirmed
      ? { icon: "radar", kicker: "Energy radar", text: "Noted. We will come back later.", cta: "Open" }
      : { icon: "radar", kicker: "A quick question", text: scenario.signal.question, cta: "Answer" };
  }
  const steps = scenario.steps.filter((s) => s.kind === "action");
  const decided = steps.filter((s) => decisions[s.id]).length;
  return confirmed
    ? { icon: "list", kicker: "Your energy plan", text: `${steps.length} steps, ${decided} decided`, cta: "Open your plan" }
    : { icon: "list", kicker: "Your energy plan", text: scenario.signal.question, cta: "Open your plan" };
}

// The first card in the For you feed. It is the only card that leads into the engine.
export default function IntentCard({ scenario, confirmed, decisions, onOpen }) {
  const s = summary(scenario, confirmed, decisions);
  return (
    <button type="button" className={`cx-feed-card cx-intent${s.quiet ? " is-quiet" : ""}`} onClick={onOpen}>
      <Icon name={s.icon} size={34} className="cx-feed-icon" />
      <span className="cx-feed-body">
        <span className="cx-feed-kicker">
          {s.kicker}
          {s.quiet && <span className="cx-new-tag">New</span>}
        </span>
        <span className="cx-feed-text">{s.text}</span>
        <span className="cx-intent-cta">
          {s.cta}
          <Icon name="chevronRight" size={16} />
        </span>
      </span>
    </button>
  );
}
