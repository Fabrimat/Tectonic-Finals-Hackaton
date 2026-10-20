import { stages } from "../../data/scenarios";
import ConsentStrip from "./ConsentStrip";

export default function InsightCard({ scenario, confirmed, onConfirm, onDecline }) {
  const { insight } = scenario;
  return (
    <section className="cx-card cx-insight" aria-labelledby="cx-insight-title">
      <h1 id="cx-insight-title" className="cx-question">
        {insight.title}
      </h1>
      <p className="cx-insight-body">{insight.body}</p>
      <p className="cx-small-title">Data used</p>
      <ul className="cx-chips">
        {insight.basis.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="cx-consent">With your consent, in line with GDPR</p>
      <ConsentStrip context="analysis" />
      <details className="cx-disclosure">
        <summary>More about this</summary>
        <p>{insight.more}</p>
        <p className="cx-muted">{stages.whisper.note}</p>
        <p className="cx-muted">Please check that this data is right. Nothing is built on it until you confirm.</p>
      </details>
      {confirmed ? (
        <p className="cx-reply" role="status">
          Thank you. Nothing is built on this or shared.
        </p>
      ) : (
        <div className="cx-actions">
          <button type="button" className="cx-btn cx-btn-outline" onClick={onConfirm}>
            This looks right
          </button>
          <button type="button" className="cx-btn cx-btn-ghost" onClick={onDecline}>
            Not quite right
          </button>
        </div>
      )}
    </section>
  );
}
