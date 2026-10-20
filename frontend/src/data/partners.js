// Demo ecosystem. Every partner name is an assumption for the demo, not an agreement.
// Edit this file to change the map: roles group partners, flows describe what moves between
// KBC and each role. direction "out" leaves KBC, "in" comes back to KBC.
// kind: "intent" | "commission" | "data". consent: true marks data that moves only with the customer's yes.
// proposed: true marks a partner that is not in the KBC catalogue yet.
export const hub = {
  id: "kbc",
  name: "KBC",
  tagline: "Orchestrator. The customer confirms every step.",
};

export const status = "Partner names are demo assumptions, not agreements";

const trade = [
  { direction: "out", kind: "intent", label: "Confirmed intents" },
  { direction: "in", kind: "commission", label: "Commission" },
];

export const roles = [
  {
    id: "data",
    label: "Data",
    brings: "Meter and consumption data, shared only with consent",
    partners: [{ name: "Fluvius", proposed: true }],
    flows: [{ direction: "in", kind: "data", label: "Consumption data", consent: true }],
  },
  {
    id: "certificates",
    label: "Certificates",
    brings: "EPC certificates and inspections",
    partners: [{ name: "De Immowinkel" }],
    flows: trade,
  },
  {
    id: "advice",
    label: "Advice and grants",
    brings: "Renovation cost and grant estimates, sustainability advice",
    partners: [{ name: "Setle" }, { name: "Encon" }],
    flows: trade,
  },
  {
    id: "installation",
    label: "Installation",
    brings: "Insulation, heating, air conditioning, panels, batteries",
    partners: [{ name: "Impact us today" }, { name: "Solar and battery installer (to choose)", proposed: true }],
    flows: trade,
  },
  {
    id: "charging",
    label: "Charging",
    brings: "Home and business charging for electric vehicles",
    partners: [{ name: "Blink Charging (formerly Blue Corner)", proposed: true }],
    flows: trade,
  },
  {
    id: "collective",
    label: "Collective buying and supply",
    brings: "Group prices on electricity, gas and solar panels",
    partners: [
      { name: "Samen Overstappen" },
      { name: "Provincial group purchases", proposed: true },
      { name: "EnergyVision (recent winner)", proposed: true },
      { name: "Mega (recent winner)", proposed: true },
    ],
    flows: [
      { direction: "out", kind: "intent", label: "Round enrolment" },
      { direction: "in", kind: "commission", label: "Commission" },
    ],
  },
  {
    id: "footprint",
    label: "Business footprint",
    brings: "Emissions insight, ESG reporting, water resilience",
    partners: [{ name: "KBC business CO2 insights" }, { name: "Kube ESG" }, { name: "Sweco" }],
    flows: trade,
  },
  {
    id: "finance",
    label: "Finance and protection",
    brings: "Energy loan, home insurance, electric car insurance, leasing",
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
