import LeadCard from "./LeadCard";
import HiddenPanel from "./HiddenPanel";

export default function Leads({ partner, leads, offers, onSend }) {
  return (
    <div className="pp-leads">
      <section aria-labelledby="leads-h">
        <h2 id="leads-h" className="pp-h">{partner ? partner.name : "All partners"}</h2>
        {leads.length === 0 ? (
          <p className="pp-empty">No leads yet. They appear when a customer accepts a step.</p>
        ) : (
          <ul className="pp-list">
            {leads.map((lead) => (
              <LeadCard key={lead.ref} lead={lead} offer={offers[lead.ref]} onSend={onSend} showPartner={!partner} />
            ))}
          </ul>
        )}
      </section>
      <HiddenPanel />
    </div>
  );
}
