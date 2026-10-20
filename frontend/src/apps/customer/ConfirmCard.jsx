import { useState } from "react";
import ConsentStrip from "./ConsentStrip";

const REPLIES = {
  later: "No problem. We will not ask again until you open the app next time.",
  no: "Understood. Nothing was computed and nothing was shared with anyone.",
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
      <p className="cx-eyebrow">A quick check</p>
      <h1 id="cx-question" className="cx-question">
        {signal.question}
      </h1>

      <ul className="cx-evidence">
        {signal.evidence.map((item) => (
          <li key={item.label}>
            <span className="cx-evidence-label">{item.label}</span>
            <span className="cx-evidence-detail">{item.detail}</span>
          </li>
        ))}
      </ul>

      <div className="cx-datanote">
        <h2 className="cx-small-title">Data used</h2>
        <ul className="cx-plain-list">
          {signal.dataUsed.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="cx-consent">With your consent, in line with GDPR</p>
      </div>

      <ConsentStrip context="goal" />

      <details className="cx-disclosure">
        <summary>Why am I seeing this?</summary>
        <h2 className="cx-small-title">What we did not use</h2>
        <ul className="cx-plain-list">
          {signal.dataNotUsed.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
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
          <button type="button" className="cx-btn cx-btn-ghost" onClick={() => answer("no")}>
            No
          </button>
        </div>
      )}
    </section>
  );
}
