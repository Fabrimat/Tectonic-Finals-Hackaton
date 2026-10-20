import { stages } from "../../data/scenarios";
import ConsentStrip from "./ConsentStrip";

export default function InsightCard({ scenario, confirmed, onConfirm, onDecline }) {
  const { insight } = scenario;
  return (
    <section className="cx-card cx-insight" aria-labelledby="cx-insight-title">
      <p className="cx-eyebrow">Something we noticed</p>
      <h1 id="cx-insight-title" className="cx-question">
        {insight.title}
      </h1>
      <p className="cx-insight-body">{insight.body}</p>
      <ConsentStrip context="analysis" />
      <h2 className="cx-small-title">Data used</h2>
      <ul className="cx-plain-list">
        {insight.basis.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="cx-reply">{stages.whisper.note}</p>
      {confirmed ? (
        <p className="cx-reply" role="status">
          Thank you. Nothing is built on this and nothing is shared. You can use the options below if you like.
        </p>
      ) : (
        <>
          <p className="cx-consent">With your consent, in line with GDPR</p>
          <p className="cx-muted">Please check that this data is right. Nothing is built on it until you confirm.</p>
          <div className="cx-actions">
            <button type="button" className="cx-btn cx-btn-outline" onClick={onConfirm}>
              This looks right
            </button>
            <button type="button" className="cx-btn cx-btn-ghost" onClick={onDecline}>
              Not quite right
            </button>
          </div>
        </>
      )}
    </section>
  );
}
