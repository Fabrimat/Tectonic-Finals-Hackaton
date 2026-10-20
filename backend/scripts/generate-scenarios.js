// Rebuilds data/scenarios.json from the rules engine. Run with `npm run generate:scenarios`.
const { writeFileSync } = require('fs');
const { join } = require('path');
const { randomBytes } = require('crypto');

const root = join(__dirname, '..');
process.env.PARTNER_API_KEY = process.env.PARTNER_API_KEY || randomBytes(24).toString('hex');

const { PlanService } = require(join(root, 'dist/plan/plan.service'));
const { CatalogueService } = require(join(root, 'dist/catalogue/catalogue.service'));
const { parseDate } = require(join(root, 'dist/plan/rules'));

const service = new PlanService(new CatalogueService());
const asOf = parseDate('2026-10-20');

const houseArea = {
  buildingStockAge: 55,
  historicCentre: false,
  openGroupRounds: ['solar-panels-east-flanders-2026'],
};
const whisperHouse = {
  flags: ['epc_e_or_f', 'energy_bill_rising'],
  dates: [{ kind: 'renovation_deadline', date: '2029-06-15' }],
};
const formingHouse = {
  flags: [...whisperHouse.flags, 'energy_pages_visited'],
  dates: [...whisperHouse.dates, { kind: 'boiler_end_of_life', date: '2027-03-01' }],
};
const readyHouse = { ...formingHouse, flags: [...formingHouse.flags, 'boiler_repair_invoice'] };

const bakeryArea = {
  buildingStockAge: 70,
  historicCentre: true,
  openGroupRounds: ['electricity-gas-flemish-brabant-2026'],
};
const bakeryFlags = ['energy_cost_rising', 'delivery_vans_in_brussels_zone'];

const scenarios = [
  {
    id: 'household-maes',
    title: 'Sofie and Tom Maes, Ghent',
    area: houseArea,
    stages: { whisper: whisperHouse, forming: formingHouse, ready: readyHouse },
  },
  {
    id: 'bakery-leuven',
    title: 'Bakery in Leuven',
    area: bakeryArea,
    stages: {
      whisper: { flags: ['energy_cost_rising'], dates: [{ kind: 'van_replacement_due', date: '2027-06-01' }] },
      forming: { flags: bakeryFlags, dates: [{ kind: 'van_replacement_due', date: '2027-03-01' }] },
      ready: {
        flags: bakeryFlags,
        dates: [{ kind: 'van_replacement_due', date: '2027-01-05' }],
        spend: [{ category: 'vehicle_deposit', total: 2500, count: 1 }],
      },
    },
  },
];

const out = scenarios.map(({ id, title, area, stages }) => {
  const plans = {};
  for (const [stage, signals] of Object.entries(stages)) {
    const plan = service.build({ scenarioId: id, area, ...signals }, asOf);
    plan.source = 'cached';
    plans[stage] = plan;
  }
  return { id, title, plans };
});

writeFileSync(join(root, 'data/scenarios.json'), JSON.stringify(out, null, 2) + '\n');
for (const s of out) {
  for (const [stage, plan] of Object.entries(s.plans)) {
    const m = plan.matches[0];
    console.log(`${s.id} ${stage}: shown ${m ? m.stage : 'none'}, score ${m ? m.score : '-'}, steps ${plan.steps.length}`);
  }
}
