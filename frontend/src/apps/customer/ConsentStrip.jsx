import { contexts, layers } from "../../data/consent";

// Four consent layers in one calm line, with what applies now and what is not happening yet.
export default function ConsentStrip({ context }) {
  const { layer, now, not } = contexts[context];
  return (
    <div className="cx-consent-strip">
      <ol className="cx-layers" aria-label="Four separate consents">
        {layers.map((item, i) => {
          const n = i + 1;
          const state = n < layer ? "is-done" : n === layer ? "is-now" : "is-next";
          return (
            <li key={item.id} className={state} aria-current={n === layer ? "step" : undefined}>
              <span className="cx-layer-bar" />
              <span className="cx-layer-label">{item.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="cx-layer-now">
        <strong>Now:</strong> {now}
      </p>
      <p className="cx-layer-not">Not yet: {not.charAt(0).toLowerCase() + not.slice(1)} Before a request is sent you can change your mind on each layer.</p>
    </div>
  );
}
