// Regulatory facts. text is the precise statement kept for the pitch notes, generic is the soft
// line the UI shows. Use factLine() to read one: until confirmed is true only the generic line
// is returned. Recheck each fact against its source before the pitch, then set confirmed.
// Keep dates, fines and grant amounts out of every line.
export const facts = {
  renovationRule: {
    text: "A home with energy label E or F must reach at least label D within six years of a change of ownership.",
    generic: "Rules for older homes may ask for energy improvements over time. Check the official source before deciding.",
    source: "Flemish energy agency",
    // Synthetic purchase date. The period and the date drive the renovation clock on the home screen.
    clock: { purchaseDate: "2024-06-15", periodYears: 6 },
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

// Fixed demo date so the clock reads the same in every screenshot.
export const demoToday = "2026-10-20";

function parseDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  const real = date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
  return real ? date : null;
}

const DAY = 86400000;

// Time left on the clock. Returns null for a bad date or period. Past the deadline everything clamps to 0.
export function clockRemaining(clock, today = demoToday) {
  const start = parseDate(clock?.purchaseDate);
  const now = parseDate(today);
  if (!start || !now || !(clock.periodYears > 0)) return null;
  const end = new Date(start);
  end.setUTCFullYear(end.getUTCFullYear() + clock.periodYears);
  const total = end - start;
  const left = Math.max(0, end - now);
  const days = Math.ceil(left / DAY);
  return { days, years: days / 365.25, fraction: Math.min(1, left / total) };
}

// Soft wording for the ring, rounded to whole years, or months in the last year.
export function clockLabel(remaining) {
  if (!remaining) return "";
  if (remaining.days === 0) return "Time is up";
  if (remaining.years < 1) {
    const months = Math.max(1, Math.round(remaining.years * 12));
    return `about ${months} ${months === 1 ? "month" : "months"} left`;
  }
  const years = Math.round(remaining.years);
  return `about ${years} ${years === 1 ? "year" : "years"} left`;
}
