import { catalogueItem } from "../../data/scenarios";
import { assumptions, eur, kbcEstimate } from "./economics";
import Assumptions from "./Assumptions";

function Bar({ value, max, label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="pp-bar-track" role="img" aria-label={`${label}: ${pct}%`}>
      <div className="pp-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function ecosystemsOf(steps) {
  const names = new Set();
  for (const step of steps) {
    const item = step.catalogueId ? catalogueItem(step.catalogueId) : null;
    names.add(item ? item.ecosystem : "Proposed new capability");
  }
  return [...names];
}

export default function Numbers({ scenario, decisions, leads, partners }) {
  const accepted = scenario.steps.filter((s) => s.kind === "action" && decisions[s.id] === "accepted");
  const saving = accepted.reduce((sum, s) => sum + s.saving, 0);
  const savingPossible = scenario.steps.filter((s) => s.kind === "action").reduce((sum, s) => sum + s.saving, 0);
  const avoided = scenario.steps.filter((s) => s.kind === "skip").reduce((sum, s) => sum + s.saving, 0);
  const kbc = kbcEstimate(leads, accepted.length);
  const perPartner = partners.map((p) => ({ name: p.name, count: leads.filter((l) => l.partner === p.name).length }));
  const leadsPossible = scenario.steps.filter((s) => s.partner && s.intent).length;
  const ecosystems = ecosystemsOf(accepted);

  return (
    <div className="pp-numbers">
      <h2 className="pp-h">Triple win for this scenario</h2>
      <div className="pp-cols">
        <section className="pp-col" aria-labelledby="col-customer">
          <h3 id="col-customer">Customer</h3>
          <p className="pp-big">{eur(saving)}</p>
          <p className="pp-note">Yearly saving from accepted steps</p>
          <Bar value={saving} max={savingPossible} label="Share of possible saving" />
          <p className="pp-big pp-big-sm">{eur(avoided)}</p>
          <p className="pp-note">Avoided cost, not sold</p>
        </section>
        <section className="pp-col" aria-labelledby="col-kbc">
          <h3 id="col-kbc">KBC</h3>
          <p className="pp-big">{eur(kbc.total)}</p>
          <p className="pp-note">Estimated yearly value</p>
          <Bar value={Math.min(accepted.length, assumptions.retentionMinSteps)} max={assumptions.retentionMinSteps} label="Progress to retention threshold" />
          <dl className="pp-sum">
            <div><dt>Partner commission</dt><dd>{eur(kbc.commission)}</dd></div>
            <div><dt>Retention uplift</dt><dd>{eur(kbc.retention)}</dd></div>
          </dl>
          <p className="pp-note">
            {kbc.eligible
              ? "Three or more steps accepted, retention uplift counts."
              : `Accept ${assumptions.retentionMinSteps} steps to count retention uplift.`}
          </p>
        </section>
        <section className="pp-col" aria-labelledby="col-partners">
          <h3 id="col-partners">Partners</h3>
          <p className="pp-big">{leads.length}</p>
          <p className="pp-note">Qualified leads</p>
          <Bar value={leads.length} max={leadsPossible} label="Share of possible leads" />
          <ul className="pp-split">
            {perPartner.map((p) => (
              <li key={p.name}><span>{p.name}</span><strong>{p.count}</strong></li>
            ))}
          </ul>
        </section>
      </div>

      <section className="pp-foot" aria-labelledby="eco-h">
        <h3 id="eco-h" className="pp-h">Ecosystems touched</h3>
        {ecosystems.length === 0 ? (
          <p className="pp-note">None yet.</p>
        ) : (
          <ul className="pp-chips">
            {ecosystems.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </section>

      <Assumptions kbc={kbc} leads={leads} />
    </div>
  );
}
