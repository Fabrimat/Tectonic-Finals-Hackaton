import { useEffect, useRef } from "react";
import { bandLabels } from "../../data/scenarios";

export default function PartnerSheet({ steps, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="cx-overlay" onClick={onClose}>
      <section
        className="cx-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cx-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="cx-sheet-title">What partners see</h2>
        <p className="cx-sheet-note">Anonymous, and only for steps you accepted.</p>
        <details className="cx-more">
          <summary>Details</summary>
          <p className="cx-muted">
            Your name, contact details and transactions are not shared. Contact details are released only when you
            authorise that partner for that step. A request that has been sent cannot be taken back yet.
          </p>
        </details>

        {steps.length === 0 ? (
          <p className="cx-muted">Nothing is shared yet.</p>
        ) : (
          <ul className="cx-intents">
            {steps.map((step) => (
              <li key={step.id}>
                <h3>{step.partner ? step.partner.name : step.title}</h3>
                <dl>
                  <dt>Service</dt>
                  <dd>{step.intent.service}</dd>
                  <dt>Region</dt>
                  <dd>{step.intent.region}</dd>
                  <dt>Timeframe</dt>
                  <dd>{step.intent.timeframe}</dd>
                  <dt>Budget</dt>
                  <dd>{bandLabels[step.intent.budgetBand]}</dd>
                </dl>
              </li>
            ))}
          </ul>
        )}

        <button ref={closeRef} type="button" className="cx-btn cx-btn-primary" onClick={onClose}>
          Close
        </button>
      </section>
    </div>
  );
}
