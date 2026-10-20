import LeadCard from "./LeadCard";
import HiddenPanel from "./HiddenPanel";

export default function Leads({ partner, leads, offers, onSend }) {
  return (
    <div className="pp-leads">
      <section aria-labelledby="leads-h">
        <h2 id="leads-h" className="pp-h">Leads for {partner?.name}</h2>
        {leads.length === 0 ? (
          <p className="pp-empty">No confirmed intents yet. Leads appear when a customer accepts a step.</p>
        ) : (
          <ul className="pp-list">
            {leads.map((lead) => (
              <LeadCard key={lead.ref} lead={lead} offer={offers[lead.ref]} onSend={onSend} />
            ))}
          </ul>
        )}
      </section>
      <HiddenPanel />
    </div>
  );
}
