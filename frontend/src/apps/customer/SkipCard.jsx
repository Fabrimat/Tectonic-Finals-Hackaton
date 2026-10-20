import { CatalogueTag } from "./StepCard";
import { money } from "./format";

export default function SkipCard({ step }) {
  return (
    <article className="cx-card cx-skip">
      <div className="cx-tags">
        <span className="cx-tag cx-tag-skip">Not needed</span>
        <CatalogueTag step={step} />
      </div>
      <h2 className="cx-step-title">{step.title}</h2>
      <p className="cx-step-summary">{step.why}</p>
      {step.saving > 0 && <p className="cx-avoided">Estimated avoided cost: about {money(step.saving)}</p>}
    </article>
  );
}
