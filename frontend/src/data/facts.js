// Regulatory facts. text is the precise statement kept for the pitch notes, generic is the soft
// line the UI shows. Use factLine() to read one: until confirmed is true only the generic line
// is returned. Recheck each fact against its source before the pitch, then set confirmed.
// Keep dates, fines and grant amounts out of every line.
export const facts = {
  renovationRule: {
    text: "A home with energy label E or F must reach at least label D within six years of a change of ownership.",
    generic: "Rules for older homes may ask for energy improvements over time. Check the official source before deciding.",
    source: "Flemish energy agency",
    confirmed: false,
  },
  grantChanges: {
    text: "Several renovation grants for insulation and heating have been reduced this year.",
    generic: "Renovation grants can change. Check the current ones before deciding.",
    source: "Flemish energy agency",
    confirmed: false,
  },
  brusselsBan: {
    text: "Brussels no longer lets older diesel vans into its low-emission zone.",
    generic: "Brussels limits some older diesel vans in its low-emission zone. Check the official rules for your vans.",
    source: "Brussels Environment",
    confirmed: false,
  },
  historicCentre: {
    text: "This home is in a historic centre. Rules for roofs and facades can be different there, so an adviser checks them before any quote.",
    generic: "This home is in a historic centre. Rules for roofs and facades can be different there, so an adviser checks them before any quote.",
    source: "City heritage service",
    confirmed: false,
  },
};

export function factLine(fact) {
  return fact.confirmed ? fact.text : fact.generic;
}
