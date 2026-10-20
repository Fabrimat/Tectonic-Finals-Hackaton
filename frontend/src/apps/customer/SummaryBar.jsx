import { useState } from "react";
import PartnerSheet from "./PartnerSheet";
import { money } from "./format";

function count(steps, decisions, value) {
  return steps.filter((s) => s.kind === "action" && decisions[s.id] === value).length;
}

export default function SummaryBar({ scenario, decisions, onReset }) {
  const [sheet, setSheet] = useState(false);
  const { steps } = scenario;
  const accepted = steps.filter((s) => decisions[s.id] === "accepted");
  const saved = accepted.reduce((sum, s) => sum + s.saving, 0);
  const avoided = steps.filter((s) => s.kind === "skip").reduce((sum, s) => sum + s.saving, 0);
  const shared = accepted.filter((s) => s.intent);

  return (
    <>
      <footer className="cx-summary" aria-label="Plan summary">
        <p className="cx-counts">
          <span>{count(steps, decisions, "accepted")} accepted</span>
          <span>{count(steps, decisions, "deferred")} later</span>
          <span>{count(steps, decisions, "rejected")} not for me</span>
        </p>
        <p className="cx-totals">
          Saving per year <strong>{money(saved)}</strong>
          {avoided > 0 && (
            <>
              {" "}
              <span className="cx-muted">+ {money(avoided)} avoided</span>
            </>
          )}
          <small className="cx-demo-mark">Demo estimate</small>
        </p>
        <div className="cx-summary-row">
          <button type="button" className="cx-btn cx-btn-outline" onClick={() => setSheet(true)}>
            What partners see
          </button>
          <button type="button" className="cx-link" onClick={onReset}>
            Start over
          </button>
        </div>
      </footer>
      {sheet && <PartnerSheet steps={shared} onClose={() => setSheet(false)} />}
    </>
  );
}
