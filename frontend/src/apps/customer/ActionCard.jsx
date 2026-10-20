import { catalogueItem } from "../../data/scenarios";

const LABEL = {
  optional: "Optional",
  opportunity: "Something to keep in mind",
  introduction: "An introduction",
};

const LAYER = {
  optional: "Consent layer: analysis. Nothing goes to a partner.",
  opportunity: "Consent layer: goal. Noted on this device only.",
  introduction: "Consent layer: sharing, not yet. You authorise each partner per step.",
};

export default function ActionCard({ action, enabled, chosen, onChoose, onUndo }) {
  const item = action.catalogueId ? catalogueItem(action.catalogueId) : null;
  const names = action.partners ?? (action.partner ? [action.partner] : []);

  return (
    <article className="cx-card cx-action">
      <div className="cx-tags">
        <span className="cx-tag cx-tag-skip">{LABEL[action.kind]}</span>
        {item && (
          <span className="cx-tag">
            {item.ecosystem} / {item.name}
          </span>
        )}
        {names.map((name) => (
          <span key={name} className="cx-badge">
            {name}
          </span>
        ))}
      </div>
      <h2 className="cx-step-title">{action.title}</h2>
      <p className="cx-step-summary">{action.body}</p>
      <p className="cx-layer-chip">{LAYER[action.kind]}</p>
      <p className="cx-shares">{action.shares}</p>
      {chosen ? (
        <div className="cx-decided">
          <span className="cx-state cx-state-deferred">Noted on this device only</span>
          <button type="button" className="cx-link" onClick={onUndo}>
            Undo
          </button>
        </div>
      ) : (
        <div className="cx-choices">
          <button type="button" className="cx-btn cx-btn-outline" disabled={!enabled} onClick={onChoose}>
            {action.choice}
          </button>
          {!enabled && <span className="cx-muted">Confirm the data above first.</span>}
        </div>
      )}
    </article>
  );
}
