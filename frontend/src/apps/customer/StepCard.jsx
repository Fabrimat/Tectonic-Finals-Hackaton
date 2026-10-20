import { useState } from "react";
import { catalogueItem } from "../../data/scenarios";
import { money } from "./format";

const STATE_LABEL = {
  accepted: "Accepted",
  deferred: "Saved for later",
  rejected: "Not for me",
};

export function CatalogueTag({ step }) {
  const item = step.catalogueId ? catalogueItem(step.catalogueId) : null;
  if (item) {
    return (
      <span className="cx-tag">
        {item.ecosystem} / {item.name}
      </span>
    );
  }
  if (step.proposed) return <span className="cx-tag cx-tag-new">New capability</span>;
  return null;
}

export default function StepCard({ step, signal, decision, onDecide, onUndo }) {
  const [open, setOpen] = useState(false);
  const panelId = `why-${step.id}`;

  return (
    <article className={`cx-card cx-step${decision ? ` is-${decision}` : ""}`}>
      <div className="cx-tags">
        <CatalogueTag step={step} />
        {step.partner && (
          <span className="cx-badge">
            {step.partner.name}
            {step.partner.newPartner && <em>New partner</em>}
          </span>
        )}
      </div>

      <h2 className="cx-step-title">{step.title}</h2>
      <p className="cx-step-summary">{step.summary}</p>
      {step.saving > 0 && <p className="cx-saving">About {money(step.saving)} saved per year</p>}

      <button
        type="button"
        className="cx-link"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        Why this
        <span className={`cx-chevron${open ? " is-open" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} className="cx-why">
          <p>{step.why}</p>
          <p className="cx-why-data">Based on: {signal.dataUsed.join("; ")}.</p>
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
