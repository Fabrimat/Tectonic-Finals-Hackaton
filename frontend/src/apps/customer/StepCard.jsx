import { useState } from "react";
import { catalogueItem, levers } from "../../data/scenarios";
import { money } from "./format";

const STATE_LABEL = {
  accepted: "Accepted",
  deferred: "Later",
  rejected: "Not for me",
};

export default function StepCard({ step, signal, notes = [], decision, onDecide, onUndo }) {
  const [open, setOpen] = useState(false);
  const panelId = `why-${step.id}`;
  const item = step.catalogueId ? catalogueItem(step.catalogueId) : null;

  return (
    <article className={`cx-card cx-step${decision ? ` is-${decision}` : ""}`}>
      {step.partner && (
        <div className="cx-tags">
          <span className="cx-badge">
            {step.partner.name}
            {step.partner.proposed && <em>Proposed</em>}
          </span>
        </div>
      )}

      <h2 className="cx-step-title">{step.title}</h2>
      <p className="cx-step-summary">{step.summary}</p>

      <button
        type="button"
        className="cx-link"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        Details
        <span className={`cx-chevron${open ? " is-open" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} className="cx-why">
          <p>{step.why}</p>
          {step.saving > 0 && <p className="cx-saving">Demo estimate: about {money(step.saving)} per year</p>}
          {notes.map((note) => (
            <p key={note} className="cx-area-note">
              {note}
            </p>
          ))}
          <p className="cx-why-data">
            {[item ? `${item.ecosystem} / ${item.name}` : step.proposed ? "Proposed" : null, step.lever ? levers[step.lever] : null]
              .filter(Boolean)
              .join(". ")}
          </p>
          <p className="cx-why-data">Based on: {signal.dataUsed.join(", ")}.</p>
        </div>
      )}

      {decision ? (
        <div className="cx-decided">
          <span className={`cx-state cx-state-${decision}`}>{STATE_LABEL[decision]}</span>
          <button type="button" className="cx-link" onClick={onUndo} aria-label={`Undo choice for ${step.title}`}>
            Undo
          </button>
        </div>
      ) : (
        <div className="cx-choices">
          <button type="button" className="cx-btn cx-btn-primary" onClick={() => onDecide("accepted")}>
            Accept
          </button>
          <button type="button" className="cx-btn cx-btn-ghost" onClick={() => onDecide("deferred")}>
            Later
          </button>
          <button type="button" className="cx-btn cx-btn-ghost" onClick={() => onDecide("rejected")}>
            Not for me
          </button>
        </div>
      )}
    </article>
  );
}
