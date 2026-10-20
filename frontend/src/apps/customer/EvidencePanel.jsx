import { confidence, evidenceFor, reasonText } from "../../data/evidence";
import "./evidence.css";

const MAX_SIGNALS = 4;
const MAX_WEIGHT = 25;

function level(score) {
  if (score >= confidence.high) return "High";
  if (score >= confidence.low) return "Medium";
  return "Low";
}

export default function EvidencePanel({ scenarioId, stage }) {
  const data = evidenceFor(scenarioId, stage);
  if (!data) return null;
  const signals = [...data.signals].sort((a, b) => b.contribution - a.contribution).slice(0, MAX_SIGNALS);
  const held = data.suppressed[0];

  return (
    <div className="ev">
      <ul className="ev-signals" aria-label="Signals">
        {signals.map((s) => (
          <li key={s.label} className="ev-signal">
            <span className="ev-label">{s.label}</span>
            <span className="ev-track">
              <span className="ev-bar" style={{ width: `${Math.min(100, (s.contribution / MAX_WEIGHT) * 100)}%` }} />
            </span>
            <span className="ev-num">+{s.contribution}</span>
          </li>
        ))}
      </ul>

      <div className="ev-confidence">
        <p className="ev-row">
          <span className="ev-label">Confidence</span>
          <strong className="ev-level">
            {level(data.score)} {data.score}
          </strong>
        </p>
        <div
          className="ev-meter"
          role="meter"
          aria-label="Confidence score"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={data.score}
        >
          <span className="ev-meter-fill" style={{ width: `${data.score}%` }} />
          <span className="ev-tick" style={{ left: `${confidence.low}%` }} />
          <span className="ev-tick" style={{ left: `${confidence.high}%` }} />
        </div>
        <div className="ev-scale" aria-hidden="true">
          <span style={{ left: `${confidence.low}%` }}>Low {confidence.low}</span>
          <span style={{ left: `${confidence.high}%` }}>High {confidence.high}</span>
        </div>
      </div>

      <p className="ev-withheld">
        {held ? (
          <>
            <span className="ev-label">Withheld:</span> {held.intent}, {reasonText(held.reason)}
            {held.demo ? <span className="ev-demo">Demo data</span> : null}
          </>
        ) : (
          <span className="ev-label">Nothing withheld</span>
        )}
      </p>
    </div>
  );
}
