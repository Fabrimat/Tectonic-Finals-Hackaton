// Writes data/eval-customers.json (clean set) and data/eval-noisy.json (noisy set): synthetic
// customers with a known true stage.
// The generator draws the true stage first, then produces signals with noise (missing and spurious
// signals), so the rules are measured against labels they did not produce. Deterministic: same
// seed, same file. Run with `npm run generate:eval`.
const { writeFileSync } = require('fs');
const { join } = require('path');

const ASOF = Date.UTC(2026, 9, 20);
const DAY = 86400000;
const MONTH = 30.44 * DAY;

let state = 20261020;
function rand() {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const chance = (p) => rand() < p;
const between = (a, b) => a + rand() * (b - a);
const inMonths = (a, b) => new Date(ASOF + between(a, b) * MONTH).toISOString().slice(0, 10);

function household(label) {
  const flags = [];
  const dates = [];
  const f = (name, p) => chance(p) && flags.push(name);
  const d = (kind, p, a, b) => chance(p) && dates.push({ kind, date: inMonths(a, b) });
  if (label === 'none') {
    f('epc_e_or_f', 0.4); f('energy_bill_rising', 0.3); f('energy_pages_visited', 0.15);
    d('renovation_deadline', 0.5, 40, 80); d('boiler_end_of_life', 0.3, 14, 40);
  } else if (label === 'whisper') {
    f('epc_e_or_f', 0.92); f('energy_bill_rising', 0.7); f('energy_pages_visited', 0.1);
    d('renovation_deadline', 0.95, 12.5, 35.5); d('boiler_end_of_life', 0.15, 14, 40);
  } else if (label === 'forming') {
    f('epc_e_or_f', 0.92); f('energy_bill_rising', 0.7); f('energy_pages_visited', 0.7);
    d('renovation_deadline', 0.8, 4, 34); d('boiler_end_of_life', 0.85, 3.5, 11.5);
  } else {
    f('epc_e_or_f', 0.92); f('energy_bill_rising', 0.6); f('energy_pages_visited', 0.7);
    f('boiler_repair_invoice', 0.8);
    d('renovation_deadline', 0.8, 1, 30); d('boiler_end_of_life', 0.7, 0.2, 11);
  }
  return { flags, dates, spend: [] };
}

function business(label) {
  const flags = [];
  const dates = [];
  const spend = [];
  const f = (name, p) => chance(p) && flags.push(name);
  const d = (kind, p, a, b) => chance(p) && dates.push({ kind, date: inMonths(a, b) });
  if (label === 'none') {
    f('energy_cost_rising', 0.3); f('delivery_vans_in_brussels_zone', 0.2);
    d('van_replacement_due', 0.3, 14, 30);
  } else if (label === 'whisper') {
    f('energy_cost_rising', 0.8); f('delivery_vans_in_brussels_zone', 0.2);
    d('van_replacement_due', 0.95, 6.5, 11.5);
  } else if (label === 'forming') {
    f('energy_cost_rising', 0.7); f('delivery_vans_in_brussels_zone', 0.85);
    d('van_replacement_due', 0.85, 3.5, 5.8);
  } else {
    f('energy_cost_rising', 0.6); f('delivery_vans_in_brussels_zone', 0.8);
    d('van_replacement_due', 0.8, 0.3, 5);
    if (chance(0.85)) spend.push({ category: 'vehicle_deposit', total: Math.round(between(1500, 6000)), count: 1 });
  }
  return { flags, dates, spend };
}

const labels = ['none', 'whisper', 'forming', 'ready'];
const customers = [];
for (const [segment, make] of [['household', household], ['business', business]]) {
  labels.forEach((label) => {
    for (let i = 0; i < 12; i++) {
      const signals = make(label);
      signals.area = { buildingStockAge: Math.round(between(20, 90)), historicCentre: chance(0.2) };
      customers.push({ id: `${segment}-${label}-${i + 1}`, segment, label, signals });
    }
  });
}

function write(name, rows) {
  const lines = rows.map((c) => '  ' + JSON.stringify(c));
  writeFileSync(join(__dirname, '..', 'data', name), '[\n' + lines.join(',\n') + '\n]\n');
}
write('eval-customers.json', customers);
console.log(`wrote ${customers.length} synthetic customers`);

// Noisy set. Separate seed, drawn after the clean set so that file does not change.
// The true stage is defined here, on the customer's real situation, never by the engine:
//   household: no E or F energy label -> none; boiler repair invoice -> ready;
//              boiler end of life within 12 months -> forming; renovation deadline within
//              36 months -> whisper; otherwise none.
//   business:  vehicle deposit paid -> ready; van replacement due within 6 months and vans
//              drive into the Brussels zone -> forming; van replacement due within 12 months
//              -> whisper; otherwise none.
// A customer who dismissed the intent less than 90 days ago has true stage none (they asked
// not to see it). Windows are inclusive on the upper bound, in calendar months.
// The signals the engine sees are a lossy, noisy view of those facts.
state = 20261021;
const INTENT = { household: 'home-energy-renovation', business: 'business-energy-and-fleet' };
const SENSITIVE = ['health', 'medical', 'pharmacy', 'religion', 'political', 'union', 'gambling', 'adult'];
const TODAY = new Date(ASOF);
function plusMonths(months, days) {
  return new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth() + months, TODAY.getUTCDate() + days))
    .toISOString().slice(0, 10);
}
const pick = (list) => list[Math.floor(rand() * list.length)];
const monthsAhead = (a, b) => plusMonths(Math.floor(between(a, b)), Math.floor(between(0, 28)));
// Exactly on a window edge or one day inside it, and one day outside it.
const onEdge = (months) => plusMonths(months, pick([-1, 0, 0]));
const pastEdge = (months) => plusMonths(months, 1);

function homeFacts(target) {
  const f = { epc: true, repair: false, boiler: null, deadline: null };
  if (target === 'none') {
    const kind = pick(['noepc', 'far', 'late', 'empty']);
    if (kind === 'noepc') {
      f.epc = false; f.repair = chance(0.3); f.boiler = monthsAhead(1, 11); f.deadline = monthsAhead(2, 30);
    } else if (kind === 'far') {
      f.deadline = pick([monthsAhead(37, 80), pastEdge(36)]);
      f.boiler = pick([null, monthsAhead(13, 40), pastEdge(12)]);
    } else if (kind === 'late') {
      f.deadline = plusMonths(-6, 0); f.boiler = plusMonths(-2, 0);
    }
  } else if (target === 'whisper') {
    f.deadline = pick([monthsAhead(13, 35), onEdge(36), onEdge(36)]);
    f.boiler = pick([null, monthsAhead(13, 40), pastEdge(12), plusMonths(-1, 0)]);
  } else if (target === 'forming') {
    f.boiler = pick([monthsAhead(1, 11), onEdge(12), onEdge(12), plusMonths(0, 0)]);
    f.deadline = pick([null, monthsAhead(2, 35), monthsAhead(37, 80), plusMonths(-3, 0)]);
  } else {
    f.repair = true;
    f.boiler = pick([null, monthsAhead(1, 11), monthsAhead(20, 40)]);
    f.deadline = pick([null, monthsAhead(1, 30), monthsAhead(37, 80)]);
  }
  return f;
}

function bizFacts(target) {
  const f = { deposit: false, vans: chance(0.5), van: null };
  if (target === 'none') {
    const kind = pick(['far', 'late', 'empty']);
    if (kind === 'far') f.van = pick([monthsAhead(13, 40), pastEdge(12)]);
    else if (kind === 'late') f.van = plusMonths(-4, 0);
  } else if (target === 'whisper') {
    const outside = chance(0.25);
    f.van = outside ? pastEdge(6) : pick([monthsAhead(7, 11), onEdge(12), onEdge(12)]);
    if (outside) f.vans = true;
  } else if (target === 'forming') {
    f.vans = true;
    f.van = pick([monthsAhead(1, 5), onEdge(6), onEdge(6), plusMonths(0, 0)]);
  } else {
    f.deposit = true;
    f.van = pick([null, monthsAhead(1, 5), monthsAhead(18, 40), plusMonths(-2, 0)]);
  }
  return f;
}

const inWindow = (date, months) => date !== null && date >= plusMonths(0, 0) && date <= plusMonths(months, 0);

function trueStage(segment, f, history) {
  const dismissed = history.some((h) => h.intent === INTENT[segment] && h.decision === 'dismissed' && h.daysAgo < 90);
  if (dismissed) return 'none';
  if (segment === 'household') {
    if (!f.epc) return 'none';
    if (f.repair) return 'ready';
    if (inWindow(f.boiler, 12)) return 'forming';
    return inWindow(f.deadline, 36) ? 'whisper' : 'none';
  }
  if (f.deposit) return 'ready';
  if (inWindow(f.van, 6) && f.vans) return 'forming';
  return inWindow(f.van, 12) ? 'whisper' : 'none';
}

function observe(segment, f) {
  const flags = [];
  const dates = [];
  const spend = [];
  const seen = (name, p) => chance(p) && flags.push(name);
  const when = (kind, date) => {
    if (date === null || chance(0.1)) return;
    dates.push({ kind, date: chance(0.04) ? pick(['soon', '2027-13-40', '']) : date });
  };
  if (segment === 'household') {
    seen('epc_e_or_f', f.epc ? 0.92 : 0.03);
    if (f.repair) seen('boiler_repair_invoice', 0.9);
    seen('energy_bill_rising', 0.5);
    seen('energy_pages_visited', 0.4);
    when('renovation_deadline', f.deadline);
    when('boiler_end_of_life', f.boiler);
  } else {
    seen('energy_cost_rising', 0.5);
    if (f.vans) seen('delivery_vans_in_brussels_zone', 0.9);
    if (f.deposit && chance(0.9)) {
      spend.push({ category: 'vehicle_deposit', total: Math.round(between(1500, 6000)), count: 1 });
    }
    when('van_replacement_due', f.van);
  }
  return { flags, dates, spend };
}

function historyFor(segment) {
  const rows = [];
  if (!chance(0.3)) return rows;
  const intent = INTENT[segment];
  const day = (a, b) => Math.round(between(a, b));
  const kind = pick(['dismissed-recent', 'dismissed-edge', 'dismissed-old', 'snoozed-recent', 'snoozed-edge', 'snoozed-old', 'other']);
  if (kind === 'dismissed-recent') rows.push({ intent, decision: 'dismissed', daysAgo: day(2, 85) });
  else if (kind === 'dismissed-edge') rows.push({ intent, decision: 'dismissed', daysAgo: pick([89, 90, 91]) });
  else if (kind === 'dismissed-old') rows.push({ intent, decision: 'dismissed', daysAgo: day(100, 300) });
  else if (kind === 'snoozed-recent') rows.push({ intent, decision: 'snoozed', daysAgo: day(1, 28) });
  else if (kind === 'snoozed-edge') rows.push({ intent, decision: 'snoozed', daysAgo: pick([29, 30, 31]) });
  else if (kind === 'snoozed-old') rows.push({ intent, decision: 'snoozed', daysAgo: day(40, 120) });
  else rows.push({ intent: 'unrelated-intent', decision: pick(['dismissed', 'snoozed']), daysAgo: day(1, 60) });
  if (segment === 'business' && chance(0.3)) {
    rows.push({ intent: 'unrelated-intent', decision: 'dismissed', daysAgo: day(1, 120), category: 'vehicle_deposit' });
  }
  return rows;
}

const noisy = [];
for (const segment of ['household', 'business']) {
  for (const target of labels) {
    for (let i = 0; i < 40; i++) {
      const facts = segment === 'household' ? homeFacts(target) : bizFacts(target);
      if (trueStage(segment, facts, []) !== target) throw new Error(`facts do not match ${target}`);
      const signals = observe(segment, facts);
      const rows = historyFor(segment);
      if (rows.length > 0) signals.history = rows;
      if (chance(0.25)) {
        // duplicate rows, plus a stale copy of the first date
        signals.flags = signals.flags.concat(signals.flags);
        signals.spend = signals.spend.concat(signals.spend);
        signals.dates = signals.dates.concat(signals.dates.map((d) => ({ ...d })));
        const first = signals.dates[0];
        if (first) signals.dates.push({ kind: first.kind, date: plusMonths(-5, 0) });
      }
      signals.area = { buildingStockAge: Math.round(between(20, 90)), historicCentre: chance(0.2) };
      const withoutSensitive = JSON.parse(JSON.stringify(signals));
      if (chance(0.4)) {
        const count = 1 + Math.floor(rand() * 3);
        for (let k = 0; k < count; k++) {
          signals.spend.push({
            category: pick(SENSITIVE),
            total: Math.round(between(200, 9000)),
            count: 1 + Math.floor(rand() * 4),
          });
        }
      }
      noisy.push({
        id: `${segment}-${target}-${i + 1}`,
        segment,
        label: trueStage(segment, facts, rows),
        signals,
        withoutSensitive,
      });
    }
  }
}
write('eval-noisy.json', noisy);
console.log(`wrote ${noisy.length} noisy synthetic customers`);
