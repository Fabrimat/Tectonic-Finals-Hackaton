import { assumptions as a, eur } from "./economics";

const pct = (n) => `${Math.round(n * 100)}%`;

export default function Assumptions({ kbc, leads }) {
  return (
    <section className="pp-assume" aria-labelledby="assume-h">
      <h3 id="assume-h" className="pp-h">Estimates for the proof of concept</h3>
      <table>
        <tbody>
          <tr><th scope="row">Lead to signed deal</th><td>{pct(a.conversion)}</td></tr>
          <tr><th scope="row">Average lead value, band A</th><td>{eur(a.leadValue.A)}</td></tr>
          <tr><th scope="row">Average lead value, band B</th><td>{eur(a.leadValue.B)}</td></tr>
          <tr><th scope="row">Average lead value, band C</th><td>{eur(a.leadValue.C)}</td></tr>
          <tr><th scope="row">KBC commission on a signed deal</th><td>{pct(a.commission)}</td></tr>
          <tr>
            <th scope="row">Retention uplift</th>
            <td>{a.retentionYears} extra year on {pct(a.retentionShare)} of customers who accept {a.retentionMinSteps} or more steps</td>
          </tr>
          <tr><th scope="row">Margin per retained customer</th><td>{eur(a.marginPerYear)} per year</td></tr>
        </tbody>
      </table>
      <p className="pp-note">
        Commission = sum of lead values x {pct(a.conversion)} x {pct(a.commission)} = {eur(kbc.commission)} from {leads.length} lead
        {leads.length === 1 ? "" : "s"}. Retention = {pct(a.retentionShare)} x {eur(a.marginPerYear)} x {a.retentionYears} year = {eur(a.retentionShare * a.marginPerYear * a.retentionYears)} per qualifying customer.
      </p>
    </section>
  );
}
