const hidden = ["Name", "Address", "Phone and email", "Account balance", "Transaction history", "The data KBC used to predict the need"];

function Lock() {
  return (
    <svg className="pp-lock" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function HiddenPanel() {
  return (
    <aside className="pp-hidden" aria-labelledby="hidden-h">
      <h2 id="hidden-h" className="pp-h"><Lock /> Not shared before the customer authorises</h2>
      <ul>
        {hidden.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>A partner first receives an anonymous intent: service, area, timeframe and budget band. Contact details are released only after the customer authorises that partner for that step. A paid step needs its own approval from the customer.</p>
    </aside>
  );
}
