import LeadCard from "./LeadCard";
import HiddenPanel from "./HiddenPanel";
import NeighbourhoodCard from "./NeighbourhoodCard";
import { withheldCount } from "./neighbourhood";

function EmptyLeads() {
  return (
    <div className="pp-empty">
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 5h16v11H8l-4 4z M8 9h8 M8 12h5" />
      </svg>
      <p>No leads yet.</p>
      <p>A lead appears when a customer accepts a step.</p>
    </div>
  );
}

export default function Leads({ scenario, partner, leads, offers, onSend, clusterOnly = false }) {
  const withheld = withheldCount(scenario);
  if (clusterOnly) return <NeighbourhoodCard segment={scenario.segment} />;
  return (
    <div className="pp-leads">
      <section aria-labelledby="leads-h">
        <h2 id="leads-h" className="pp-h">{partner ? partner.name : "All partners"}</h2>
        {leads.length === 0 ? (
          <EmptyLeads />
        ) : (
          <ul className="pp-list">
            {leads.map((lead) => (
              <LeadCard key={lead.ref} lead={lead} offer={offers[lead.ref]} onSend={onSend} showPartner={!partner} />
            ))}
          </ul>
        )}
        <NeighbourhoodCard segment={scenario.segment} />
      </section>
      <div>
        <HiddenPanel />
        <p className="pp-withheld">
          <strong>{withheld}</strong> recommendations withheld
          <span>Withheld: not needed or too uncertain</span>
        </p>
      </div>
    </div>
  );
}
