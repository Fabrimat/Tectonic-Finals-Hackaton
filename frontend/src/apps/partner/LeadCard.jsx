import { useState } from "react";
import { bandLabels } from "../../data/scenarios";

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
      {showPartner && <p className="pp-for">For {lead.partner}</p>}
      <dl className="pp-facts">
        <div><dt>Region</dt><dd>{lead.region}</dd></div>
        <div><dt>Timeframe</dt><dd>{lead.timeframe}</dd></div>
        <div><dt>Budget band</dt><dd>{bandLabels[lead.band]}</dd></div>
      </dl>
      <p className="pp-private">Contact details: not shared, waiting for the customer to authorise.</p>
      {offer && (
        <p className="pp-offer">
          Your offer: EUR {offer.price}. {offer.message}
        </p>
      )}
      {offer && !offer.accepted && (
        <button type="button" className="pp-btn pp-btn-quiet" onClick={markAccepted}>
          Mark as accepted
        </button>
      )}
      {!offer && !open && (
        <button type="button" className="pp-btn" onClick={() => setOpen(true)}>
          Send offer
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
