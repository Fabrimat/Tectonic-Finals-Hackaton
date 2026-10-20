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
        <h2 id="cx-sheet-title">What partners receive</h2>
        <p className="cx-sheet-note">
          Your name, contact details and transactions are never shared. Partners only see the anonymous request below,
          and only for steps you accepted.
        </p>

        {steps.length === 0 ? (
          <p className="cx-muted">Nothing is shared yet. Accept a step with a partner to see what would be sent.</p>
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
