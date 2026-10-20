import catalogue from "./catalogue.json" with { type: "json" };
import { facts, factLine } from "./facts.js";

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
    note: "You turned on the energy radar. This stays in your own view. Nothing is shared and nothing is asked of you.",
  },
  forming: {
    label: "Forming",
    note: "We only ask a question. Nothing is shared until a plan exists and you accept a step.",
  },
  ready: {
    label: "Ready",
    note: "Steps you accept become anonymous requests to partners.",
  },
};

// The ladder stretches or compresses per segment. Windows are months ahead of the moment.
export const segments = {
  household: {
    label: "Household",
    windows: { whisper: [12, 36], forming: [3, 12], ready: [0, 3] },
  },
  business: {
    label: "Small business",
    windows: { whisper: [6, 12], forming: [3, 6], ready: [0, 3] },
  },
};

export function windowOf(segment, stage) {
  return segments[segment]?.windows[stage] ?? null;
}

export function windowLabel(segment, stage) {
  const w = windowOf(segment, stage);
  return w ? `${w[0]} to ${w[1]} months ahead` : "";
}

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
  const signal = { ...(content.signal ?? { ...noSignal, dataUsed: content.insight?.basis ?? [] }), area: scenario.area };
  return {
    id: scenario.id,
    domain: scenario.domain,
    person: scenario.person,
    area: scenario.area,
    stage: key,
    segment: scenario.segment,
    monthsAhead: content.monthsAhead,
    window: windowLabel(scenario.segment, key),
    allowedActions: content.allowedActions ?? [],
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
    id: "household-maes",
    segment: "household",
    area: {
      buildingStockAge: 60,
      historicCentre: true,
      openGroupRounds: ["round-energy-flanders", "round-solar-east-flanders"],
    },
    domain: "Homeowners in Flanders",
    person: {
      name: "Sofie and Tom Maes",
      initials: "SM",
      city: "Ghent",
      line: "1960s terraced house, bought with a KBC mortgage",
    },
    stages: {
      whisper: {
        monthsAhead: 30,
        allowedActions: [
          { kind: "awareness" },
          {
            kind: "optional",
            id: "meter-link",
            title: "Connect your meter data",
            body: "Makes the trend exact.",
            partner: "Fluvius",
            choice: "Connect meter data",
            shares: "Fluvius would share your meter readings with KBC, only after you agree. No partner receives anything.",
          },
          {
            kind: "optional",
            id: "epc-check",
            title: "An EPC check",
            body: "A current certificate makes later estimates cheaper.",
            partner: "De Immowinkel",
            choice: "Ask for an EPC check",
            shares: "Nothing is sent now. Only if you accept a step later would the partner get service, area, timeframe and budget band, never your name.",
          },
        ],
        insight: {
          title: "Your energy use is creeping up",
          body: "There is time to prepare.",
          more: `Your energy bill has gone up year after year, and your home has energy label E. ${factLine(facts.renovationRule)} There is nothing to do today. The options below are yours to use whenever you like.`,
          basis: ["Mortgage start date", "Energy label", "Energy payments"],
        },
      },
      forming: {
        monthsAhead: 6,
        allowedActions: [
          { kind: "question" },
          {
            kind: "opportunity",
            id: "solar-fit",
            title: "Solar panels, later",
            body: "Fits best after insulation and heating.",
            catalogueId: "calculate-solar-panels-and-request-a-quote",
            choice: "Keep this in mind",
            shares: "Nothing is shared. Only noted on this device.",
          },
          {
            kind: "introduction",
            id: "intro-installer",
            title: "Meet partners when you decide",
            body: "An adviser and an installer, when you are ready.",
            partners: ["Setle", "Impact us today"],
            choice: "Ask for an introduction",
            shares: "Nothing is sent now. Only once you accept a step in a plan would a partner get service, area, timeframe and budget band, never your name.",
          },
        ],
        signal: {
          question: "Are you planning to renovate?",
          evidence: [
            { label: "Heating system", detail: "The boiler is more than twenty years old", category: "Housing" },
            { label: "Energy pages in KBC Mobile", detail: "Several visits in the last weeks", category: "Housing" },
            { label: "Grants", detail: factLine(facts.grantChanges), category: "Housing" },
          ],
          dataUsed: ["Heating system age", "KBC Mobile pages", "Mortgage start date"],
          dataNotUsed: ["Account balance", "Other payments", "Location history"],
        },
        checklist: [
          "Get an up to date energy certificate",
          "Ask for a cost and grant estimate before you choose works",
          "Check whether a group purchase round is open",
        ],
      },
      ready: {
        monthsAhead: 2,
        allowedActions: [{ kind: "question" }, { kind: "plan" }],
        signal: {
          question: "Did your boiler just need an expensive repair?",
          evidence: [
            { label: "Payment to a heating technician", detail: "A repair invoice paid last week", category: "Housing" },
            { label: "Energy label E", detail: "Recorded when the home was financed", category: "Housing" },
          ],
          dataUsed: ["One card payment", "Mortgage start date"],
          dataNotUsed: ["Account balance", "Health, family or location history"],
        },
        seen: "Starting from your boiler repair.",
        steps: [
          {
            id: "epc",
            title: "Energy certificate and inspection",
            summary: "The certificate every later quote starts from.",
            why: "Quotes and grant estimates are quicker with the certificate in order.",
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
            summary: "What each work costs and which grants may apply.",
            why: factLine(facts.grantChanges),
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
            summary: "A quote for roof, walls or floor.",
            why: "Insulation comes first so the new boiler is sized for the improved house.",
            catalogueId: "insulation-quote-impact-us-today",
            areaTopics: ["historic"],
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
            summary: "Replace the old boiler with an efficient system.",
            why: "The boiler just needed a repair. Replacing it beats repairing it again.",
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
            summary: "What your roof could produce, with a quote.",
            why: "Panels lower the bill on top of insulation and heating.",
            catalogueId: "calculate-solar-panels-and-request-a-quote",
            areaTopics: ["historic"],
            roundService: "solar",
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
            summary: "Join the next open round and compare tariffs.",
            why: "Rounds open in fixed windows, so timing matters.",
            catalogueId: "group-purchase-of-electricity-and-gas",
            roundService: "energy",
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
            summary: "Sized against your expected savings.",
            why: "Smaller grants leave more cost with you. The repayment stays close to the savings.",
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
            summary: "Keep the cover right after the works.",
            why: "New heating and panels change what the policy covers. Update when the works finish.",
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
            why: "Only pays back once panels are installed.",
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
            why: "The energy loan already covers the plan.",
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
    id: "bakery-leuven",
    segment: "business",
    area: {
      buildingStockAge: 25,
      historicCentre: false,
      openGroupRounds: ["round-energy-flanders"],
    },
    domain: "Small business",
    person: {
      name: "Bakery Janssens",
      initials: "BJ",
      city: "Leuven",
      line: "Bakery, six employees, two diesel delivery vans",
    },
    stages: {
      whisper: {
        monthsAhead: 9,
        allowedActions: [
          { kind: "awareness" },
          {
            kind: "optional",
            id: "meter-link",
            title: "Connect your meter data",
            body: "Makes the trend exact.",
            partner: "Fluvius",
            choice: "Connect meter data",
            shares: "Fluvius would share the premises meter readings with KBC, only after you agree. No partner receives anything.",
          },
          {
            kind: "optional",
            id: "epc-check",
            title: "An EPC check of the premises",
            body: "Shows how much of your energy use the building explains.",
            partner: "De Immowinkel",
            choice: "Ask for an EPC check",
            shares: "Nothing is sent now. Only if you accept a step later would the partner get service, area, timeframe and budget band, never your name.",
          },
        ],
        insight: {
          title: "Energy costs are growing faster than revenue",
          body: "Nothing to do today.",
          more: "The ovens and the older building take a bigger share of each month's income than before. It is the first thing to look at when margins tighten.",
          basis: ["Energy payments", "Business revenue"],
        },
      },
      forming: {
        monthsAhead: 4,
        allowedActions: [
          { kind: "question" },
          {
            kind: "opportunity",
            id: "solar-fit",
            title: "Solar panels, later",
            body: "Fits a bakery's daytime use, whatever you decide on the vans.",
            catalogueId: "calculate-solar-panels-and-request-a-quote",
            choice: "Keep this in mind",
            shares: "Nothing is shared. Only noted on this device.",
          },
          {
            kind: "introduction",
            id: "intro-fleet",
            title: "Meet partners for vans and energy",
            body: "A charging partner and a group purchase round.",
            partners: ["Blink Charging (formerly Blue Corner)", "Samen Overstappen"],
            choice: "Ask for an introduction",
            shares: "Nothing is sent now. Only once you accept a step in a plan would a partner get service, area, timeframe and budget band, never your name.",
          },
        ],
        signal: {
          question: "Will your delivery vans need to go electric?",
          evidence: [
            { label: "Two diesel vans", detail: "Regular fuel payments and deliveries to Brussels", category: "Mobility" },
            { label: "Low-emission zone", detail: factLine(facts.brusselsBan), category: "Mobility" },
          ],
          dataUsed: ["Fuel payments", "Delivery area"],
          dataNotUsed: ["Private account", "Customer names", "Invoice contents"],
        },
        checklist: [
          "Check which of your vans the Brussels rules affect",
          "Compare leasing and financing for an electric van",
          "Plan where the van will charge",
        ],
      },
      ready: {
        monthsAhead: 2,
        allowedActions: [{ kind: "question" }, { kind: "plan" }],
        signal: {
          question: "Did you just put a deposit on an electric van?",
          evidence: [
            { label: "Payment to a van dealer", detail: "A deposit paid last Friday", category: "Mobility" },
            { label: "Charging pages", detail: "Two visits in KBC Mobile", category: "Mobility" },
          ],
          dataUsed: ["One business payment", "KBC Mobile pages"],
          dataNotUsed: ["Private account", "Customer names", "Invoice contents"],
        },
        seen: "Starting from your new van.",
        steps: [
          {
            id: "co2",
            title: "CO2 insight and sector comparison",
            summary: "Your emissions against similar businesses.",
            why: "The ovens and the vans are the two big items. This shows which to tackle first.",
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
            summary: "An adviser proposes a short list of measures.",
            why: "The building is older and the ovens use a lot of energy. Advice first keeps quotes focused.",
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
            summary: "What the roof could produce, with a quote.",
            why: "A bakery uses energy early and during the day, when panels produce.",
            catalogueId: "calculate-solar-panels-and-request-a-quote",
            areaTopics: ["historic"],
            roundService: "solar",
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
            summary: "A charging point for the new van.",
            why: "The van charges overnight at the bakery, so the point must be ready first.",
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
            summary: "Compare financing and leasing for the van.",
            why: "The deposit is paid. The rest can be financed against lower running costs.",
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
            summary: "Join the next group purchase round.",
            why: "Rounds open in fixed windows. The ovens make this the biggest cost to lower.",
            catalogueId: "group-purchase-of-electricity-and-gas",
            roundService: "energy",
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
            why: "The CO2 insight is enough for a team of six.",
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
