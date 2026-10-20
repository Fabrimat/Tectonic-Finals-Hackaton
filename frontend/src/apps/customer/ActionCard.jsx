import { catalogueItem } from "../../data/scenarios";

const LAYER = {
  optional: "Only you see this.",
  opportunity: "Noted on this device only.",
  introduction: "Not shared yet. You authorise each partner per step.",
};

export default function ActionCard({ action, enabled, chosen, onChoose, onUndo }) {
  const item = action.catalogueId ? catalogueItem(action.catalogueId) : null;
  const names = action.partners ?? (action.partner ? [action.partner] : []);

  return (
    <article className="cx-card cx-action">
      {names.length > 0 && (
        <div className="cx-tags">
          {names.map((name) => (
            <span key={name} className="cx-badge">
              {name}
            </span>
          ))}
        </div>
      )}
      <h2 className="cx-step-title">{action.title}</h2>
      <p className="cx-step-summary">{action.body}</p>
      <details className="cx-more">
        <summary>Details</summary>
        {item && (
          <p>
            {item.ecosystem} / {item.name}
          </p>
        )}
        <p className="cx-muted">{LAYER[action.kind]}</p>
        <p className="cx-muted">{action.shares}</p>
      </details>
      {chosen ? (
        <div className="cx-decided">
          <span className="cx-state cx-state-deferred">Noted on this device</span>
          <button type="button" className="cx-link" onClick={onUndo}>
            Undo
          </button>
        </div>
      ) : (
        <div className="cx-choices">
          <button type="button" className="cx-btn cx-btn-outline" aria-disabled={!enabled} onClick={enabled ? onChoose : undefined}>
            {action.choice}
          </button>
          {!enabled && <span className="cx-muted">Confirm above first.</span>}
        </div>
      )}
    </article>
  );
}
