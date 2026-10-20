import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { fetchIntents, readAccessKey, writeAccessKey } from "../../lib/api";
import { useRipple } from "../../lib/store";
import { allPartners, leadsFor, leadsFromIntents, partnersOf } from "./leadData";
import AccessField from "./AccessField";
import Leads from "./Leads";
import Numbers from "./Numbers";
import "./partner.css";

export default function PartnerApp() {
  const { scenario, confirmed, decisions } = useRipple();
  const [key, setKey] = useState(readAccessKey);
  const [remote, setRemote] = useState({ status: "nokey", intents: [] });
  const live = remote.status === "ok";
  const localPartners = partnersOf(scenario);
  const partners = live ? allPartners() : localPartners;
  const [picked, setPicked] = useState(null);
  const [offers, setOffers] = useState({});

  const current = partners.find((p) => p.name === picked) ?? partners[0];
  const localLeads = leadsFor(scenario, decisions, confirmed);
  const leads = live ? leadsFromIntents(remote.intents) : localLeads;
  const sendOffer = (ref, offer) => setOffers((prev) => ({ ...prev, [ref]: offer }));

  useEffect(() => {
    let active = true;
    const load = () =>
      fetchIntents(key).then((result) => {
        if (active) setRemote(result);
      });
    load();
    const timer = key ? setInterval(load, 5000) : null;
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [key]);

  const changeKey = (value) => {
    writeAccessKey(value);
    setKey(value);
  };

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
          {current?.proposed && <span className="pp-tag">Proposed partner</span>}
        </div>
        <Link className="pp-back" to="/">Back to start</Link>
      </header>
      <main className="pp-main">
        <AccessField value={key} onChange={changeKey} status={remote.status} />
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
            element={<Numbers scenario={scenario} decisions={decisions} leads={localLeads} partners={localPartners} />}
          />
          <Route path="*" element={<Navigate to="/partner" replace />} />
        </Routes>
      </main>
    </div>
  );
}
