import catalogue from "./catalogue.json" with { type: "json" };
import { facts } from "./facts.js";

const byId = new Map(catalogue.map((item) => [item.id, item]));

export function catalogueItem(id) {
  return byId.get(id) ?? null;
}

// Intent ladder. A scenario holds three stages for the same customer, each with its own
// content. Only "ready" ever produces anything the partner side can see.
export const stageOrder = ["whisper", "forming", "ready"];

export const stages = {
  whisper: {
    label: "Whisper",
    window: "1 to 3 years ahead",
    note: "You turned on the energy radar. This stays in your own view. Nothing is shared and nothing is asked of you.",
  },
  forming: {
    label: "Forming",
    window: "3 to 12 months ahead",
    note: "We only ask a question. Nothing is shared until a plan exists and you accept a step.",
  },
  ready: {
    label: "Ready",
    window: "0 to 3 months ahead",
    note: "Steps you accept become anonymous requests to partners.",
  },
};

export const canShare = (scenario) => scenario.stage === "ready";

export const levers = {
  timing: "Timing",
  preparation: "Preparation",
  introduction: "Introduction",
  financing: "Financing",
};

const noSignal = { question: "", evidence: [], dataUsed: [], dataNotUsed: [] };

// The flat view the apps read: the customer, the active stage content, and only the steps
// whose catalogue id exists. Unknown ids are dropped, which is the same check the plan
// generator will apply to model output.
export function viewOf(scenario, stage) {
  const key = scenario.stages[stage] ? stage : stageOrder[0];
  const content = scenario.stages[key];
  const steps = (content.steps ?? []).filter((step) => !step.catalogueId || byId.has(step.catalogueId));
  const signal = content.signal ?? { ...noSignal, dataUsed: content.insight?.basis ?? [] };
  return {
    id: scenario.id,
    domain: scenario.domain,
    person: scenario.person,
    stage: key,
    lead: content.lead,
    insight: content.insight ?? null,
    checklist: content.checklist ?? [],
    signal,
    seen: content.seen ?? "",
    steps,
  };
}

// A null catalogueId with proposed: true is a capability the catalogue does not list yet.
// kind: "action" is a step the customer can accept, defer or reject.
// kind: "skip" is a "not needed" card explaining why a product is left out.
// partner: null means KBC delivers it. proposed: true marks a partner outside the catalogue.
// lever: timing, preparation, introduction or financing.
export const scenarios = [
  {
    id: "maes-household",
    domain: "Homeowners in Flanders",
    person: {
      name: "Sofie and Tom Maes",
      initials: "SM",
      city: "Ghent",
      line: "1960s terraced house, bought with a KBC mortgage",
    },
    stages: {
      whisper: {
        lead: "About 3 years ahead",
        insight: {
          title: "Your renovation clock has been running since you bought the house",
          body: `${facts.renovationRule.text} Your house has label E, so the deadline applies to you. Your energy bill has also gone up year after year. There is nothing to do today, but starting early keeps every option open.`,
          basis: [
            "The date your mortgage started",
            "The energy label recorded when the home was financed",
            "Your energy payments over the last years",
          ],
        },
      },
      forming: {
        lead: "About 6 months ahead",
        signal: {
          question: "Are you planning to renovate?",
          evidence: [
            { label: "Heating system", detail: "The boiler is 22 years old", category: "Housing" },
            { label: "Energy pages in KBC Mobile", detail: "Several visits in the last weeks", category: "Housing" },
            { label: "Grants", detail: facts.grantChanges.text, category: "Housing" },
          ],
          dataUsed: ["Age of the heating system", "Pages viewed in KBC Mobile", "The date your mortgage started"],
          dataNotUsed: ["Account balance", "Other payments", "Location history"],
        },
        checklist: [
          "Get an up to date energy certificate",
          "Ask for a cost and grant estimate before you choose works",
          "Check whether a group purchase round is open",
        ],
      },
      ready: {
        lead: "Within 3 months",
        signal: {
          question: "Did your boiler just need an expensive repair?",
          evidence: [
            { label: "Payment to a heating technician", detail: "A repair invoice paid last week", category: "Housing" },
            { label: "Energy label E", detail: "The renovation deadline is still ahead", category: "Housing" },
          ],
          dataUsed: ["One card payment (category and amount)", "The date your mortgage started"],
          dataNotUsed: ["Account balance", "Health, family or location history"],
        },
        seen: "The boiler is the trigger. These are the steps that usually follow, in the order that keeps the cost down.",
        steps: [
          {
            id: "epc",
            title: "Energy certificate and inspection",
            summary: "A certified inspector issues the up to date certificate that every other quote starts from.",
            why: "Quotes and grant estimates are cheaper and faster when the certificate is already in order.",
            catalogueId: "certificates-and-inspections-de-immowinkel",
            partner: { name: "De Immowinkel", proposed: false },
            intent: { service: "Energy certificate and inspection", region: "Ghent", timeframe: "Q4 2026", budgetBand: "A" },
            lever: "preparation",
            kind: "action",
            saving: 0,
            order: 1,
          },
          {
            id: "estimate",
            title: "Renovation cost and grant estimate",
            summary: "A first estimate of what each work costs and which grants may apply.",
            why: `${facts.grantChanges.text} Knowing the amounts before you decide helps you pick the right order.`,
            catalogueId: "estimate-renovation-costs-and-grants-setle",
            partner: { name: "Setle", proposed: false },
            intent: { service: "Renovation cost and grant estimate", region: "Ghent", timeframe: "Q4 2026", budgetBand: "A" },
            lever: "preparation",
            kind: "action",
            saving: 0,
            order: 2,
          },
          {
            id: "insulation",
            title: "Insulation quote",
            summary: "Quote for roof, walls or floor, based on the certificate.",
            why: "Insulation comes before the heating system so the new boiler or heat pump is sized for the improved house.",
            catalogueId: "insulation-quote-impact-us-today",
            partner: { name: "Impact us today", proposed: false },
            intent: { service: "Insulation quote", region: "Ghent", timeframe: "Q1 2027", budgetBand: "C" },
            lever: "introduction",
            kind: "action",
            saving: 480,
            order: 3,
          },
          {
            id: "heating",
            title: "Heating quote",
            summary: "Quote to replace the 22-year-old boiler with an efficient system.",
            why: "The boiler has just needed a repair. Replacing it as part of the plan beats repairing it again.",
            catalogueId: "heating-quote-impact-us-today",
            partner: { name: "Impact us today", proposed: false },
            intent: { service: "Heating quote", region: "Ghent", timeframe: "Q1 2027", budgetBand: "C" },
            lever: "introduction",
            kind: "action",
            saving: 520,
            order: 4,
          },
          {
            id: "solar",
            title: "Solar panels",
            summary: "Estimate what a roof of your size can produce and request a quote.",
            why: "Panels lower the bill on top of insulation and heating, and they decide whether a battery makes sense later.",
            catalogueId: "calculate-solar-panels-and-request-a-quote",
            partner: { name: "Solar and battery installer (to choose)", proposed: true },
            intent: { service: "Solar panel quote", region: "Ghent", timeframe: "Q2 2027", budgetBand: "C" },
            lever: "introduction",
            kind: "action",
            saving: 640,
            order: 5,
          },
          {
            id: "group-purchase",
            title: "Group purchase of electricity and gas",
            summary: "Join the next open round and compare it with your current tariff.",
            why: "Rounds open in fixed windows. Joining the next one is a matter of timing, not of effort.",
            catalogueId: "group-purchase-of-electricity-and-gas",
            partner: { name: "Samen Overstappen", proposed: false },
            intent: { service: "Group energy purchase", region: "Flanders", timeframe: "Q4 2026", budgetBand: "A" },
            lever: "timing",
            kind: "action",
            saving: 310,
            order: 6,
          },
          {
            id: "energy-loan",
            title: "Energy loan",
            summary: "A loan sized against the expected savings from the works you accept.",
            why: "Smaller grants mean more of the cost lands on you. The loan is sized so the repayment stays close to the savings.",
            catalogueId: "energy-loan",
            partner: null,
            intent: null,
            lever: "financing",
            kind: "action",
            saving: 0,
            order: 7,
          },
          {
            id: "home-insurance",
            title: "Home insurance update",
            summary: "Make sure the cover matches the house after the works.",
            why: "New heating and panels change what the policy has to cover. Updating when the works finish avoids a gap.",
            catalogueId: "home-insurance",
            partner: null,
            intent: null,
            lever: "timing",
            kind: "action",
            saving: 0,
            order: 8,
          },
          {
            id: "battery",
            title: "Home battery",
            summary: "Not needed yet",
            why: "A battery only pays back once panels are installed. Revisit it after the solar step.",
            catalogueId: "calculate-a-home-battery-and-request-a-quote",
            partner: null,
            intent: null,
            kind: "skip",
            saving: 0,
            order: 9,
          },
          {
            id: "second-loan",
            title: "A separate renovation loan",
            summary: "Not needed",
            why: "The energy loan already covers the plan. A second loan would add cost without adding room.",
            catalogueId: "renovation-loan",
            partner: null,
            intent: null,
            kind: "skip",
            saving: 0,
            order: 10,
          },
        ],
      },
    },
  },
  {
    id: "bakery",
    domain: "Small business",
    person: {
      name: "Bakery Janssens",
      initials: "BJ",
      city: "Leuven",
      line: "Bakery, six employees, two diesel delivery vans",
    },
    stages: {
      whisper: {
        lead: "About 2 years ahead",
        insight: {
          title: "Your energy costs are growing faster than your revenue",
          body: "The ovens and the older building take a bigger share of each month's income than before. There is nothing to do today, but it is the first thing to look at when margins tighten.",
          basis: ["Monthly energy payments on the business account", "Monthly revenue on the business account"],
        },
      },
      forming: {
        lead: "About 9 months ahead",
        signal: {
          question: "Will your delivery vans need to go electric?",
          evidence: [
            { label: "Two diesel vans", detail: "Regular fuel payments and deliveries to Brussels", category: "Mobility" },
            { label: "Low-emission zone", detail: facts.brusselsBan.text, category: "Mobility" },
          ],
          dataUsed: ["Fuel payments (category and amount)", "Delivery area inferred from payments"],
          dataNotUsed: ["Private account", "Customer names", "Invoice contents"],
        },
        checklist: [
          "Check which of your vans the Brussels rules affect",
          "Compare leasing and financing for an electric van",
          "Plan where the van will charge",
        ],
      },
      ready: {
        lead: "Within 3 months",
        signal: {
          question: "Did you just put a deposit on an electric van?",
          evidence: [
            { label: "Payment to a van dealer", detail: "A deposit paid last Friday", category: "Mobility" },
            { label: "Charging pages", detail: "Two visits in KBC Mobile", category: "Mobility" },
          ],
          dataUsed: ["One business payment (category and amount)", "Pages viewed in KBC Mobile"],
          dataNotUsed: ["Private account", "Customer names", "Invoice contents"],
        },
        seen: "You are replacing a van. These steps usually come next, for the van and for the bakery itself.",
        steps: [
          {
            id: "co2",
            title: "CO2 insight and sector comparison",
            summary: "See where the bakery's emissions come from and how you compare with similar businesses.",
            why: "The ovens and the vans are the two big items. The comparison shows which one to tackle first.",
            catalogueId: "business-co2-insights-and-sector-comparison",
            partner: null,
            intent: null,
            lever: "preparation",
            kind: "action",
            saving: 0,
            order: 1,
          },
          {
            id: "advice",
            title: "Sustainability advice",
            summary: "An adviser looks at the building and the ovens and proposes a short list of measures.",
            why: "The building is older and the ovens use a lot of energy. Advice first keeps the later quotes focused.",
            catalogueId: "sustainability-advice-encon",
            partner: { name: "Encon", proposed: false },
            intent: { service: "Sustainability advice", region: "Leuven", timeframe: "Q4 2026", budgetBand: "B" },
            lever: "introduction",
            kind: "action",
            saving: 0,
            order: 2,
          },
          {
            id: "solar",
            title: "Solar panels for the roof",
            summary: "Estimate what the roof can produce and request a quote.",
            why: "A bakery uses energy early in the morning and during the day, when panels produce.",
            catalogueId: "calculate-solar-panels-and-request-a-quote",
            partner: { name: "Solar and battery installer (to choose)", proposed: true },
            intent: { service: "Solar panel quote", region: "Leuven", timeframe: "Q1 2027", budgetBand: "C" },
            lever: "introduction",
            kind: "action",
            saving: 1100,
            order: 3,
          },
          {
            id: "charging",
            title: "Charging at the bakery",
            summary: "A charging point at the premises for the new van and the next one.",
            why: "The van will be charged overnight at the bakery. The point has to be in place before it arrives.",
            catalogueId: null,
            proposed: true,
            partner: { name: "Blink Charging (formerly Blue Corner)", proposed: true },
            intent: { service: "Business charging point", region: "Leuven", timeframe: "Q4 2026", budgetBand: "B" },
            lever: "timing",
            kind: "action",
            saving: 0,
            order: 4,
          },
          {
            id: "van-finance",
            title: "Van financing or leasing",
            summary: "Compare financing and leasing for the electric van and the second van later.",
            why: "The deposit is paid. The remaining amount can be financed against the lower running costs.",
            catalogueId: "b2b-asset-financing",
            partner: null,
            intent: null,
            lever: "financing",
            kind: "action",
            saving: 0,
            order: 5,
          },
          {
            id: "energy-contract",
            title: "Energy contract",
            summary: "Join the next group purchase round for electricity and gas.",
            why: "Group rounds open in fixed windows. The ovens make the contract the largest running cost to lower.",
            catalogueId: "group-purchase-of-electricity-and-gas",
            partner: { name: "Samen Overstappen", proposed: false },
            intent: { service: "Group energy purchase", region: "Flanders", timeframe: "Q4 2026", budgetBand: "A" },
            lever: "timing",
            kind: "action",
            saving: 900,
            order: 6,
          },
          {
            id: "esg",
            title: "ESG report",
            summary: "Not needed",
            why: "At six employees a full ESG report is more than the bakery needs. The CO2 insight is enough.",
            catalogueId: "kube-esg",
            partner: null,
            intent: null,
            kind: "skip",
            saving: 0,
            order: 7,
          },
        ],
      },
    },
  },
];

export const bandLabels = {
  A: "Under EUR 1,000",
  B: "EUR 1,000 to 3,000",
  C: "EUR 3,000 to 10,000",
};
