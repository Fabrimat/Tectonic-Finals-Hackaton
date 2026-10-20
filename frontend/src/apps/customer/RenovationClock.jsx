import { clockLabel, clockRemaining, facts } from "../../data/facts";

const R = 34;
const CIRC = 2 * Math.PI * R;

// A ring that shows how much of the typical period for older homes is left. The numbers come
// from facts.renovationRule.clock, so they are edited in one place.
export default function RenovationClock() {
  const rule = facts.renovationRule;
  const remaining = clockRemaining(rule.clock);
  if (!remaining) return null;
  const label = clockLabel(remaining);
  return (
    <section className="cx-clock" aria-labelledby="cx-clock-h">
      <svg className="cx-clock-ring" viewBox="0 0 80 80" width="84" height="84" role="img" aria-label={label}>
        <circle cx="40" cy="40" r={R} fill="none" stroke="#e1edf6" strokeWidth="9" />
        <circle
          cx="40"
          cy="40"
          r={R}
          fill="none"
          stroke="#0a56b4"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${CIRC * remaining.fraction} ${CIRC}`}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className="cx-clock-body">
        <h2 id="cx-clock-h">
          Renovation clock
          {!rule.confirmed && <span className="cx-clock-tag">estimate</span>}
        </h2>
        <p className="cx-clock-left">{label}</p>
        <p className="cx-clock-note">Typical period for older homes{rule.confirmed ? "" : ", estimate"}</p>
      </div>
    </section>
  );
}
