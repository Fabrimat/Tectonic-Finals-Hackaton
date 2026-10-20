import { useState } from "react";
import { assumptions as a, eur, eurWhole } from "./economics";

const pct = (n) => `${Math.round(n * 100)}%`;

export default function Assumptions({ kbc, leads }) {
  const { conversion, leadValue } = a.partnerLeads;
  const r = a.retention;
  const [open, setOpen] = useState(false);
  return (
    <section className="pp-assume" aria-labelledby="assume-h">
      <h3 id="assume-h" className="pp-h">
        <button type="button" className="pp-toggle" aria-expanded={open} aria-controls="assume-body" onClick={() => setOpen(!open)}>
          {open ? "Hide assumptions" : "Show assumptions"}
        </button>
      </h3>
      <div id="assume-body" hidden={!open}>
      <table>
        <thead>
          <tr><th scope="col">KBC product</th><th scope="col">Take-up</th><th scope="col">Year 1 value</th></tr>
        </thead>
        <tbody>
          {a.kbcProducts.map((p) => (
            <tr key={p.id}><th scope="row">{p.label}</th><td>{pct(p.conversion)}</td><td>{eur(p.value)}</td></tr>
          ))}
          <tr>
            <th scope="row">Retention</th>
            <td>{pct(r.share)} with {r.minSteps}+ steps</td>
            <td>{eur(r.marginPerYear)} x {r.years} year</td>
          </tr>
        </tbody>
        <thead>
          <tr><th scope="col">Partners</th><th scope="col">Lead to deal</th><th scope="col">Lead value</th></tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">All partners</th>
            <td>{pct(conversion)}</td>
            <td>A {eur(leadValue.A)}, B {eur(leadValue.B)}, C {eur(leadValue.C)}</td>
          </tr>
          {Object.entries(a.commission).map(([name, rate]) => (
            <tr key={name}><th scope="row">{name}</th><td colSpan="2">{pct(rate)} commission</td></tr>
          ))}
          <tr><th scope="row">Other partners</th><td colSpan="2">No commission</td></tr>
        </tbody>
      </table>
      <details className="pp-more">
        <summary>How it is calculated</summary>
        <p className="pp-note">
          KBC product value = accepted KBC steps x conversion x first year value = {eurWhole(kbc.products.total)}. Partner commission = lead value x{" "}
          {pct(conversion)} x commission rate, for partners with a rate only = {eurWhole(kbc.commission.total)} from {leads.length} lead
          {leads.length === 1 ? "" : "s"}.
        </p>
      </details>
      </div>
    </section>
  );
}
