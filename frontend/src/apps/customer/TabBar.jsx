import Icon from "./icons";

const tabs = [
  { id: "start", label: "Start", icon: "wallet" },
  { id: "mykbc", label: "My KBC", icon: "list" },
  { id: "investments", label: "Investments", icon: "piggy" },
  { id: "business", label: "Business", icon: "briefcase" },
  { id: "offer", label: "Offer", icon: "layers" },
];

// Only Start leads anywhere in this prototype, the other tabs are for the look of the frame.
export default function TabBar({ onStart }) {
  return (
    <nav className="cx-tabs" aria-label="KBC Mobile">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === "start" ? "cx-tab is-active" : "cx-tab"}
          aria-current={tab.id === "start" ? "page" : undefined}
          aria-disabled={tab.id === "start" ? undefined : "true"}
          onClick={tab.id === "start" ? onStart : undefined}
        >
          <Icon name={tab.icon} size={28} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
