import { stages } from "../../data/scenarios";

export default function InsightCard({ scenario }) {
  const { insight } = scenario;
  return (
    <section className="cx-card cx-insight" aria-labelledby="cx-insight-title">
      <p className="cx-eyebrow">Something we noticed</p>
      <h1 id="cx-insight-title" className="cx-question">
        {insight.title}
      </h1>
      <p className="cx-insight-body">{insight.body}</p>
      <h2 className="cx-small-title">What this is based on</h2>
      <ul className="cx-plain-list">
        {insight.basis.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="cx-reply">{stages.whisper.note}</p>
    </section>
  );
}
