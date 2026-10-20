import { contexts, layers, layerNames } from "../../data/consent";

function ConsentText({ context }) {
  const { now, not } = contexts[context];
  return (
    <>
      <p>
        <strong>Now:</strong> {now}
      </p>
      <p className="cx-muted">
        Not yet: {not.charAt(0).toLowerCase() + not.slice(1)} Before a request is sent you can change your mind on each layer.
      </p>
      <p className="cx-muted">Four separate consents: {layerNames.join(", ").toLowerCase()}.</p>
    </>
  );
}

// Four consents as small chips, the one that applies now marked, with a plain caption underneath.
// The full wording is behind Details, or the caller shows it elsewhere with inline set.
export default function ConsentStrip({ context, note, inline = false }) {
  const { layer, caption } = contexts[context];
  return (
    <div className="cx-consent-strip">
      <ol className="cx-layers" aria-label="Four separate consents">
        {layers.map((item, i) => {
          const n = i + 1;
          const state = n < layer ? "is-done" : n === layer ? "is-now" : "is-next";
          return (
            <li key={item.id} className={state} aria-current={n === layer ? "step" : undefined} title={layerNames[i]}>
              <span className="cx-layer-bar" />
              <span className="cx-layer-label">{item.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="cx-consent-caption">
        Step {layer} of {layers.length}: {caption}
        {note ? `. ${note}` : ""}
      </p>
      {!inline && (
        <details className="cx-more">
          <summary>Details</summary>
          <ConsentText context={context} />
        </details>
      )}
    </div>
  );
}

export { ConsentText };
