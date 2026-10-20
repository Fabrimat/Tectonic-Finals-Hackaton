import { useState } from "react";
import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useRipple } from "../../lib/store";
import { leadsFor, partnersOf } from "./leadData";
import Leads from "./Leads";
import Numbers from "./Numbers";
import "./partner.css";

export default function PartnerApp() {
  const { scenario, confirmed, decisions } = useRipple();
  const partners = partnersOf(scenario);
  const [picked, setPicked] = useState(null);
  const [offers, setOffers] = useState({});

  const current = partners.find((p) => p.name === picked) ?? partners[0];
  const leads = leadsFor(scenario, decisions, confirmed);
  const sendOffer = (ref, offer) => setOffers((prev) => ({ ...prev, [ref]: offer }));

  return (
    <div className="pp">
      <header className="pp-bar">
        <h1 className="pp-title">Ripple Partner Portal</h1>
        <nav className="pp-nav" aria-label="Portal sections">
          <NavLink to="/partner" end>Leads</NavLink>
          <NavLink to="/partner/numbers">Numbers</NavLink>
        </nav>
        <div className="pp-view">
          <label htmlFor="pp-partner">View as</label>
          <select id="pp-partner" value={current?.name ?? ""} onChange={(e) => setPicked(e.target.value)}>
            {partners.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          {current?.newPartner && <span className="pp-tag">New partner</span>}
        </div>
        <Link className="pp-back" to="/">Back to start</Link>
      </header>
      <main className="pp-main">
        <Routes>
          <Route
            index
            element={
              <Leads
                partner={current}
                leads={leads.filter((l) => l.partner === current?.name)}
                offers={offers}
                onSend={sendOffer}
              />
            }
          />
          <Route
            path="numbers"
            element={<Numbers scenario={scenario} decisions={decisions} leads={leads} partners={partners} />}
          />
          <Route path="*" element={<Navigate to="/partner" replace />} />
        </Routes>
      </main>
    </div>
  );
}
