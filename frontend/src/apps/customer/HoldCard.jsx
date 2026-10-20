export default function HoldCard({ scenario }) {
  return (
    <section className="cx-card" aria-labelledby="cx-hold-title">
      <p className="cx-eyebrow">Thank you</p>
      <h1 id="cx-hold-title" className="cx-question">
        {scenario.signal.question}
      </h1>
      <p className="cx-reply" role="status">
        Noted. We will come back with a plan when the timing is closer. Nothing has been shared with anyone.
      </p>
      {scenario.checklist.length > 0 && (
        <>
          <h2 className="cx-small-title">A short checklist for now</h2>
          <ul className="cx-plain-list">
            {scenario.checklist.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
