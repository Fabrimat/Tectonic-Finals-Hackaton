// Writes data/eval-customers.json: synthetic customers with a known true stage.
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

const lines = customers.map((c) => '  ' + JSON.stringify(c));
writeFileSync(join(__dirname, '..', 'data', 'eval-customers.json'), '[\n' + lines.join(',\n') + '\n]\n');
console.log(`wrote ${customers.length} synthetic customers`);
