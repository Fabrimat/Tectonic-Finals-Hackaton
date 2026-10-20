export default function HoldCard({ scenario }) {
  return (
    <section className="cx-card" aria-labelledby="cx-hold-title">
      <h1 id="cx-hold-title" className="cx-question">
        {scenario.signal.question}
      </h1>
      <p className="cx-reply" role="status">
        Noted. Nothing is shared.
      </p>
      {scenario.checklist.length > 0 && (
        <details className="cx-disclosure">
          <summary>A short checklist for now</summary>
          <ul className="cx-plain-list">
            {scenario.checklist.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
