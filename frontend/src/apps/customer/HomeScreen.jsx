import { homeOf, walletPromo } from "../../data/accounts";
import KbcLogo from "../../components/KbcLogo";
import IntentCard from "./IntentCard";
import Icon from "./icons";

function Tile({ tone }) {
  if (tone === "card") {
    return (
      <span className="cx-tile-art" aria-hidden="true">
        <svg viewBox="0 0 120 92" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <rect width="120" height="92" fill="#16386e" />
          <rect x="30" y="26" width="60" height="40" rx="6" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M30 38h60" stroke="#fff" strokeWidth="2" />
          <rect x="37" y="50" width="14" height="8" rx="2" fill="#fff" opacity="0.8" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`cx-tile-art is-${tone}`} aria-hidden="true">
      <svg viewBox="0 0 120 92" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <polygon points="0,0 70,0 0,60" fill="#fff" opacity="0.08" />
        <polygon points="120,0 120,70 40,92 70,0" fill="#fff" opacity="0.07" />
        <polygon points="0,92 60,92 120,50 120,92" fill="#fff" opacity="0.1" />
        <g fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="36" y="32" width="48" height="34" rx="9" />
          <path d="M38 36V30a6 6 0 0 1 6-6h24" />
        </g>
        <circle cx="76" cy="49" r="3" fill="#fff" />
      </svg>
    </span>
  );
}

function Account({ account }) {
  return (
    <li className={`cx-acc${account.active ? " is-active" : ""}`}>
      <div className="cx-tile">
        <Tile tone={account.tone} />
        {account.tag && <span className="cx-acc-tag">{account.tag}</span>}
        {account.tone !== "card" && (
          <span className="cx-acc-edit" aria-hidden="true">
            <Icon name="pencil" size={14} />
          </span>
        )}
      </div>
      <div className="cx-acc-info">
        <p className="cx-acc-name">{account.name}</p>
        <p className="cx-acc-amount">
          {account.amount}
          <small>,{account.cents} EUR</small>
        </p>
        {account.active && <span className="cx-acc-bar" />}
      </div>
    </li>
  );
}

export default function HomeScreen({ scenario, confirmed, decisions, onOpen, tools }) {
  const home = homeOf(scenario.id);
  return (
    <div className="cx-home">
      <div className="cx-home-brand">
        <KbcLogo className="cx-logo" />
      </div>
      <header className="cx-home-top">
        <button type="button" className="cx-round" aria-label="Settings">
          <Icon name="settings" size={26} />
        </button>
        <div className="cx-search">
          <Icon name="search" size={20} />
          <span className="cx-search-text">How can I help you?</span>
        </div>
        <button type="button" className="cx-bell" aria-label="Notifications">
          <Icon name="bell" size={28} />
          <span className="cx-bell-dot" />
        </button>
      </header>

      <ul className="cx-accounts" aria-label="Accounts">
        {home.accounts.map((a) => (
          <Account key={a.id} account={a} />
        ))}
      </ul>

      <button type="button" className="cx-show-pay">
        <Icon name="chevronDown" size={20} />
        Show payments
      </button>

      <section className="cx-foryou" aria-labelledby="cx-foryou-h">
        <div className="cx-section-head">
          <h2 id="cx-foryou-h">For you</h2>
          <button type="button" className="cx-text-link">
            All communications
          </button>
        </div>
        <IntentCard scenario={scenario} confirmed={confirmed} decisions={decisions} onOpen={onOpen} />
        {home.feed.map((item) => (
          <div key={item.icon} className="cx-feed-card">
            <Icon name={item.icon} size={34} className="cx-feed-icon" />
            <span className="cx-feed-body">
              <span className="cx-feed-text">{item.text}</span>
            </span>
            <span className="cx-feed-close" aria-hidden="true">
              <Icon name="close" size={12} />
            </span>
          </div>
        ))}
      </section>

      <section className="cx-promo-wrap" aria-labelledby="cx-wallet-h">
        <div className="cx-section-head">
          <h2 id="cx-wallet-h">{walletPromo.title}</h2>
          <button type="button" className="cx-text-link">
            {walletPromo.link}
          </button>
        </div>
        <div className="cx-promo">
          <h3>{walletPromo.title}</h3>
          <p>{walletPromo.body}</p>
          <span className="cx-promo-fab" aria-hidden="true">
            <Icon name="swap" size={30} />
          </span>
        </div>
      </section>

      {tools}
    </div>
  );
}
