// Placeholder ecosystem for the demo. Every partner here is an assumption, not an agreement.
// Edit this file to change the map: roles group partners, flows describe what moves between
// KBC and each role. direction "out" leaves KBC, "in" comes back to KBC.
// kind: "intent" | "commission" | "data". consent: true marks data that moves only with the customer's yes.
export const hub = {
  id: "kbc",
  name: "KBC",
  tagline: "Orchestrator, the customer decides each step",
};

export const status = "Assumptions for the demo, not agreements";

export const roles = [
  {
    id: "data",
    label: "Data",
    brings: "Meter and consumption data",
    partners: [{ name: "Fluvius" }],
    flows: [{ direction: "in", kind: "data", label: "Consumption data", consent: true }],
  },
  {
    id: "advice",
    label: "Advice and grants",
    brings: "Renovation cost and grant estimates",
    partners: [{ name: "Setle", inCatalogue: true }, { name: "Encon", inCatalogue: true }],
    flows: [
      { direction: "out", kind: "intent", label: "Confirmed intents" },
      { direction: "in", kind: "commission", label: "Commission" },
    ],
  },
  {
    id: "installation",
    label: "Installation",
    brings: "Insulation, heating, panels, batteries",
    partners: [{ name: "Impact us today", inCatalogue: true }, { name: "Solar and battery installer (to choose)" }],
    flows: [
      { direction: "out", kind: "intent", label: "Confirmed intents" },
      { direction: "in", kind: "commission", label: "Commission" },
    ],
  },
  {
    id: "charging",
    label: "Charging",
    brings: "Home and public charging",
    partners: [{ name: "Powerdale" }, { name: "Blue Corner" }],
    flows: [
      { direction: "out", kind: "intent", label: "Confirmed intents" },
      { direction: "in", kind: "commission", label: "Commission" },
    ],
  },
  {
    id: "collective",
    label: "Collective buying and supply",
    brings: "Group prices on electricity, gas and solar",
    partners: [
      { name: "Samen Overstappen", inCatalogue: true },
      { name: "Wikipower" },
      { name: "Provincial group purchases" },
      { name: "EnergyVision" },
      { name: "Mega" },
    ],
    flows: [
      { direction: "out", kind: "intent", label: "Round enrolment" },
      { direction: "in", kind: "commission", label: "Commission" },
    ],
  },
  {
    id: "finance",
    label: "Finance and protection",
    brings: "Energy loan, home and car insurance",
    inHouse: true,
    partners: [{ name: "KBC" }],
    flows: [],
  },
];

export const flowKinds = {
  intent: { label: "Anonymous confirmed intent: service, area, timeframe, budget band", color: "#00a0dc" },
  commission: { label: "Commission and leads back to KBC", color: "#1a9d6c" },
  data: { label: "Data, only with the customer's consent", color: "#f5a623" },
};
