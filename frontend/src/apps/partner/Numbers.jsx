import { catalogueItem } from "../../data/scenarios";
import { assumptions, eur, eurWhole, kbcEstimate } from "./economics";
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
  const kbc = kbcEstimate({ acceptedIds: accepted.map((s) => s.id), leads });
  const perPartner = partners.map((p) => ({ name: p.name, count: leads.filter((l) => l.partner === p.name).length }));
  const leadsPossible = scenario.steps.filter((s) => s.partner && s.intent).length;
  const ecosystems = ecosystemsOf(accepted);
  const { minSteps } = assumptions.retention;

  return (
    <div className="pp-numbers">
      <h2 className="pp-h">Value per customer <span className="pp-tag">Demo estimate</span></h2>
      <div className="pp-cols">
        <section className="pp-col pp-col-main" aria-labelledby="col-kbc">
          <h3 id="col-kbc">KBC products</h3>
          <p className="pp-big">{eurWhole(kbc.own)}</p>
          <p className="pp-note">First year</p>
          <dl className="pp-sum">
            {kbc.products.items.map((item) => (
              <div key={item.id}><dt>{item.label}, {Math.round(item.conversion * 100)}%</dt><dd>{eurWhole(item.expected)}</dd></div>
            ))}
            {kbc.products.items.length === 0 && <div><dt>No KBC product step yet</dt><dd>{eur(0)}</dd></div>}
            <div><dt>Retention</dt><dd>{eurWhole(kbc.retention.amount)}</dd></div>
          </dl>
          <Bar value={Math.min(accepted.length, minSteps)} max={minSteps} label="Progress to retention threshold" />
          <p className="pp-note">{Math.min(accepted.length, minSteps)} of {minSteps} steps for retention</p>
          <p className="pp-note">
            At {assumptions.cohort.toLocaleString("en-GB")} customers: {eurWhole(kbc.own * assumptions.cohort)}
          </p>
        </section>
        <section className="pp-col" aria-labelledby="col-customer">
          <h3 id="col-customer">Customer</h3>
          <p className="pp-big">{eur(saving)}</p>
          <p className="pp-note">Saved per year</p>
          <Bar value={saving} max={savingPossible} label="Share of possible estimated saving" />
          <p className="pp-big pp-big-sm">{accepted.length} of {scenario.steps.filter((s) => s.kind === "action").length}</p>
          <p className="pp-note">Steps accepted</p>
          {avoided > 0 && <p className="pp-note">Avoided cost: {eur(avoided)}</p>}
        </section>
        <section className="pp-col" aria-labelledby="col-partners">
          <h3 id="col-partners">Partners</h3>
          <p className="pp-big">{leads.length}</p>
          <p className="pp-note">Leads sent</p>
          <Bar value={leads.length} max={leadsPossible} label="Share of possible leads" />
          <ul className="pp-split">
            {perPartner.map((p) => (
              <li key={p.name}><span>{p.name}</span><strong>{p.count}</strong></li>
            ))}
          </ul>
          <div className="pp-secondary">
            <p className="pp-mid">{eurWhole(kbc.commission.total)}</p>
            <p className="pp-note">
              Commission, {kbc.commission.partnersWithRate} of {kbc.commission.items.length} partners
            </p>
          </div>
        </section>
      </div>

      {ecosystems.length > 0 && (
        <ul className="pp-chips pp-eco" aria-label="Ecosystems touched">
          {ecosystems.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}

      <Assumptions kbc={kbc} leads={leads} />
    </div>
  );
}
