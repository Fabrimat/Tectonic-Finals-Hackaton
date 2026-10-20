import { assumptions as a, eur, eurWhole } from "./economics";

const pct = (n) => `${Math.round(n * 100)}%`;

export default function Assumptions({ kbc, leads }) {
  const { conversion, leadValue } = a.partnerLeads;
  const r = a.retention;
  return (
    <section className="pp-assume" aria-labelledby="assume-h">
      <h3 id="assume-h" className="pp-h">Assumptions, all estimates</h3>
      <p className="pp-note pp-assume-lead">{a.note}</p>
      <table>
        <thead>
          <tr><th scope="col">KBC products</th><th scope="col">Step accepted to product taken</th><th scope="col">Value in the first year</th></tr>
        </thead>
        <tbody>
          {a.kbcProducts.map((p) => (
            <tr key={p.id}><th scope="row">{p.label}</th><td>{pct(p.conversion)}</td><td>{eur(p.value)}</td></tr>
          ))}
          <tr>
            <th scope="row">Retention uplift</th>
            <td>{pct(r.share)} of customers with {r.minSteps} or more accepted steps</td>
            <td>{eur(r.marginPerYear)} for {r.years} extra year</td>
          </tr>
        </tbody>
        <thead>
          <tr><th scope="col">Partners, secondary</th><th scope="col">Lead to signed deal</th><th scope="col">Average lead value</th></tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">All partners</th>
            <td>{pct(conversion)}</td>
            <td>A {eur(leadValue.A)}, B {eur(leadValue.B)}, C {eur(leadValue.C)}</td>
          </tr>
          {Object.entries(a.commission).map(([name, rate]) => (
            <tr key={name}><th scope="row">{name}</th><td colSpan="2">Commission {pct(rate)} of a signed deal</td></tr>
          ))}
          <tr><th scope="row">Other partners</th><td colSpan="2">No commission, they only receive confirmed leads</td></tr>
        </tbody>
      </table>
      <p className="pp-note">
        KBC product value = accepted KBC steps x conversion x first year value = {eurWhole(kbc.products.total)}. Partner commission = lead value x{" "}
        {pct(conversion)} x commission rate, for partners with a rate only = {eurWhole(kbc.commission.total)} from {leads.length} lead
        {leads.length === 1 ? "" : "s"}.
      </p>
    </section>
  );
}
