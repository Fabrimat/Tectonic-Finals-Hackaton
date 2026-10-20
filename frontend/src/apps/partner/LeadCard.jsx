import { useState } from "react";
import { bandLabels } from "../../data/scenarios";

const icons = {
  region: <path d="M12 21s-6-5.6-6-10a6 6 0 0 1 12 0c0 4.4-6 10-6 10z M12 8.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />,
  timeframe: <path d="M5 6h14v14H5z M5 10h14 M9 3v5 M15 3v5" />,
  band: <path d="M17 7.5A6 6 0 1 0 17 16.5 M6 10h8 M6 14h8" />,
};

function Fact({ kind, label, value }) {
  return (
    <div title={label}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {icons[kind]}
      </svg>
      <dt className="pp-sr">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

// Accepted is the end state of a lead. In this prototype the customer's
// final choice is not modelled, so cards stop at Offer sent unless marked.
export default function LeadCard({ lead, offer, onSend, showPartner = false }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const status = offer?.accepted ? "Accepted" : offer ? "Offer sent" : "New";

  const submit = (e) => {
    e.preventDefault();
    onSend(lead.ref, { price: price.trim(), message: message.trim() });
    setOpen(false);
  };

  const markAccepted = () => onSend(lead.ref, { ...offer, accepted: true });

  return (
    <li className="pp-card">
      <div className="pp-card-head">
        <span className="pp-ref">{lead.ref}</span>
        <span className={`pp-status is-${status.toLowerCase().replace(" ", "-")}`}>{status}</span>
      </div>
      <h3 className="pp-service">{lead.service}</h3>
      {showPartner && <p className="pp-for">{lead.partner}</p>}
      <dl className="pp-facts">
        <Fact kind="region" label="Region" value={lead.region} />
        <Fact kind="timeframe" label="Timeframe" value={lead.timeframe} />
        <Fact kind="band" label="Budget band" value={bandLabels[lead.band]} />
      </dl>
      <p className="pp-private" title="Contact details are not shared before the customer authorises">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        Contact hidden
      </p>
      {offer && (
        <p className="pp-offer">
          EUR {offer.price}. {offer.message}
        </p>
      )}
      {offer && !offer.accepted && (
        <button type="button" className="pp-btn pp-btn-quiet" onClick={markAccepted}>
          Mark as accepted
        </button>
      )}
      {!offer && !open && (
        <button type="button" className="pp-btn" onClick={() => setOpen(true)}>
          Send offer (no contact details)
        </button>
      )}
      {!offer && open && (
        <form className="pp-form" onSubmit={submit}>
          <label>
            Price (EUR)
            <input type="number" min="0" required value={price} onChange={(e) => setPrice(e.target.value)} />
          </label>
          <label>
            Message
            <input type="text" maxLength="140" required value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
          <div className="pp-form-actions">
            <button type="submit" className="pp-btn">Send</button>
            <button type="button" className="pp-btn pp-btn-quiet" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
    </li>
  );
}
