import { useState } from "react";
import ConsentStrip, { ConsentText } from "./ConsentStrip";

const REPLIES = {
  later: "No problem. We will ask next time.",
  no: "Understood. Nothing was computed or shared.",
};

export default function ConfirmCard({ scenario, onConfirm, onDecline }) {
  const [reply, setReply] = useState(null);
  const { signal } = scenario;

  function answer(kind) {
    if (kind === "no") onDecline();
    setReply(kind);
  }

  return (
    <section className="cx-card cx-confirm" aria-labelledby="cx-question">
      <h1 id="cx-question" className="cx-question">
        {signal.question}
      </h1>

      <p className="cx-datanote">
        <strong>Data used:</strong> {signal.dataUsed.join(", ")}.
      </p>

      <ConsentStrip context="goal" note="With your consent, in line with GDPR" inline />

      <details className="cx-disclosure">
        <summary>Why am I seeing this?</summary>
        {/* Slot for the evidence breakdown. The list below stands in until it is filled. */}
        <div className="evidence-slot">
          <ul className="cx-evidence">
            {signal.evidence.map((item) => (
              <li key={item.label}>
                <span className="cx-evidence-label">{item.label}</span>
                <span className="cx-evidence-detail">{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
        <h2 className="cx-small-title">What we did not use</h2>
        <ul className="cx-plain-list">
          {signal.dataNotUsed.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <ConsentText context="goal" />
      </details>

      {reply ? (
        <p className="cx-reply" role="status">
          {REPLIES[reply]}
        </p>
      ) : (
        <div className="cx-actions">
          <button type="button" className="cx-btn cx-btn-primary" onClick={onConfirm}>
            Yes, that's right
          </button>
          <button type="button" className="cx-btn cx-btn-ghost" onClick={() => answer("later")}>
            Not now
          </button>
          <button type="button" className="cx-link cx-no" onClick={() => answer("no")}>
            No
          </button>
        </div>
      )}
    </section>
  );
}
