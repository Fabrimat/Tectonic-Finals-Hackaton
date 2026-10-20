// Demo ecosystem. Every partner name is an assumption for the demo, not an agreement.
// Edit this file to change the map: roles group partners, flows describe what moves between
// KBC and each role. direction "out" leaves KBC, "in" comes back to KBC.
// kind: "intent" | "commission" | "data". consent: true marks data that moves only with the customer's yes.
// proposed: true marks a partner that is not in the KBC catalogue yet.
export const hub = {
  id: "kbc",
  name: "KBC",
};

export const status = "Demo partners, not agreements";

const trade = [
  { direction: "out", kind: "intent", label: "Intents" },
  { direction: "in", kind: "commission", label: "Commission" },
];

export const roles = [
  {
    id: "data",
    label: "Data",
    partners: [{ name: "Fluvius", proposed: true }],
    flows: [{ direction: "in", kind: "data", label: "Data", consent: true }],
  },
  {
    id: "certificates",
    label: "Certificates",
    partners: [{ name: "De Immowinkel" }],
    flows: trade,
  },
  {
    id: "advice",
    label: "Advice",
    partners: [{ name: "Setle" }, { name: "Encon" }],
    flows: trade,
  },
  {
    id: "installation",
    label: "Install",
    partners: [{ name: "Impact us today" }, { name: "Solar installer", proposed: true }],
    flows: trade,
  },
  {
    id: "charging",
    label: "Charging",
    partners: [{ name: "Blink Charging", proposed: true }],
    flows: trade,
  },
  {
    id: "collective",
    label: "Group buying",
    partners: [
      { name: "Samen Overstappen" },
      { name: "Provincial groups", proposed: true },
      { name: "EnergyVision", proposed: true },
      { name: "Mega", proposed: true },
    ],
    flows: [
      { direction: "out", kind: "intent", label: "Enrolment" },
      { direction: "in", kind: "commission", label: "Commission" },
    ],
  },
  {
    id: "footprint",
    label: "Footprint",
    partners: [{ name: "KBC CO2 insights" }, { name: "Kube ESG" }, { name: "Sweco" }],
    flows: trade,
  },
  {
    id: "finance",
    label: "Finance",
    inHouse: true,
    partners: [{ name: "KBC" }],
    flows: [],
  },
];

export const flowKinds = {
  intent: { label: "Anonymous intent", color: "#00a0dc" },
  commission: { label: "Commission", color: "#1a9d6c" },
  data: { label: "Data, with consent", color: "#f5a623" },
};
