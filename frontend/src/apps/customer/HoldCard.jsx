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
    </section>
  );
}
