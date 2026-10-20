import { catalogueItem } from "../../data/scenarios";
import { acceptedSteps, assumptions, decisionCounts, defaultDecisions, eur, eurWhole, kbcEstimate } from "./economics";
import { leadsFor } from "./leadData";
import Assumptions from "./Assumptions";
import "./numbers.css";

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

function captionOf(counts) {
  return [`${counts.accepted} accepted`, `${counts.deferred} later`, `${counts.rejected} declined`].join(", ");
}

export default function Numbers({ scenario, decisions: given, leads: givenLeads, partners }) {
  const decided = Object.keys(given).length > 0;
  const decisions = decided ? given : defaultDecisions(scenario.id);
  const leads = decided ? givenLeads : leadsFor(scenario, decisions, true);
  const actions = scenario.steps.filter((s) => s.kind === "action");
  const accepted = acceptedSteps(scenario.steps, decisions);
  const counts = decisionCounts(scenario.steps, decisions);
  const saving = accepted.reduce((sum, s) => sum + s.saving, 0);
  const savingPossible = actions.reduce((sum, s) => sum + s.saving, 0);
  const avoided = scenario.steps.filter((s) => s.kind === "skip").reduce((sum, s) => sum + s.saving, 0);
  const kbc = kbcEstimate({ acceptedIds: accepted.map((s) => s.id), leads });
  const perPartner = partners.map((p) => ({ name: p.name, count: leads.filter((l) => l.partner === p.name).length }));
  const leadsPossible = scenario.steps.filter((s) => s.partner && s.intent).length;
  const ecosystems = ecosystemsOf(accepted);
  const { minSteps } = assumptions.retention;

  return (
    <div className="pp-numbers">
      <h2 className="pp-h">Value per customer <span className="pp-tag">Demo estimate</span></h2>
      <p className="pp-counted">Counting {captionOf(counts)}</p>
      <div className="pp-cols">
        <section className="pp-col pp-col-main" aria-labelledby="col-kbc">
          <h3 id="col-kbc">Into KBC products</h3>
          <p className="pp-big">{eurWhole(kbc.own)}</p>
          <p className="pp-note">First year, per customer</p>
          <p className="pp-line"><span>Product take-up</span><strong>{eurWhole(kbc.products.total)}</strong></p>
          <p className="pp-line">
            <span>Retention ({Math.min(accepted.length, minSteps)} of {minSteps} steps)</span>
            <strong>{eurWhole(kbc.retention.amount)}</strong>
          </p>
        </section>
        <section className="pp-col" aria-labelledby="col-customer">
          <h3 id="col-customer">Customer</h3>
          <p className="pp-big">{eur(saving)}</p>
          <p className="pp-note">Saved per year, {accepted.length} of {actions.length} steps</p>
          <Bar value={saving} max={savingPossible} label="Share of possible estimated saving" />
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
