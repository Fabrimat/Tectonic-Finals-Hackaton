import { readFileSync } from 'fs';
import { join } from 'path';
import { CatalogueService } from '../catalogue/catalogue.service';
import { PlanService } from './plan.service';
import { CachedScenario, Fact, Rule } from './plan.types';
import { parseDate } from './rules';

process.env.PARTNER_API_KEY ??= 'test-key-0123456789abcdef-test';

const asOf = parseDate('2026-10-20') as Date;
const whisper = {
  flags: ['epc_e_or_f', 'energy_bill_rising'],
  dates: [{ kind: 'renovation_deadline', date: '2029-06-15' }],
};
const forming = {
  flags: [...whisper.flags, 'energy_pages_visited'],
  dates: [...whisper.dates, { kind: 'boiler_end_of_life', date: '2027-03-01' }],
};
const ready = { ...forming, flags: [...forming.flags, 'boiler_repair_invoice'] };

describe('PlanService', () => {
  const catalogue = new CatalogueService();
  const service = new PlanService(catalogue);

  it('returns steps for the ready stage, built from catalogue entries', () => {
    const plan = service.build(ready, asOf);
    expect(plan.matches[0].stage).toBe('ready');
    expect(plan.matches[0].facts.length).toBeGreaterThan(0);
    for (const step of plan.steps.filter((s) => !s.proposed)) {
      expect(catalogue.findOne(step.id)?.name).toBe(step.title);
    }
  });

  it('marks new capabilities as proposed and never as catalogue items', () => {
    const proposed = service.build(ready, asOf).steps.filter((s) => s.proposed);
    expect(proposed.map((s) => s.id)).toEqual(['heat-pump-installation']);
    expect(catalogue.findOne('heat-pump-installation')).toBeUndefined();
  });

  it('includes a not-needed step', () => {
    const notNeeded = service.build(ready, asOf).steps.filter((s) => s.notNeeded);
    expect(notNeeded.map((s) => s.id)).toEqual(['calculate-a-home-battery-and-request-a-quote']);
  });

  it.each([
    [whisper, 'whisper'],
    [forming, 'forming'],
  ])('returns no partner steps before the ready stage (%#)', (signals, stage) => {
    const plan = service.build(signals, asOf);
    expect(plan.matches[0].stage).toBe(stage);
    expect(plan.steps).toEqual([]);
    expect(plan.actions.length).toBeGreaterThan(0);
    expect(plan.actions.every((a) => a.kind !== 'plan')).toBe(true);
    expect(plan.actions.every((a) => !a.sharesData || a.optional)).toBe(true);
  });

  it('offers only awareness and customer-initiated actions in whisper', () => {
    const actions = service.build(whisper, asOf).actions;
    expect(actions.map((a) => a.kind).sort()).toEqual(['awareness', 'optional', 'optional']);
    const meter = actions.find((a) => a.id === 'fluvius-meter-data-connection');
    expect(meter).toMatchObject({ proposed: true, optional: true, sharesData: true });
    expect(catalogue.findOne('fluvius-meter-data-connection')).toBeUndefined();
    expect(actions.find((a) => a.kind === 'awareness')?.sharesData).toBe(false);
  });

  it('adds opportunity and introduction actions from forming', () => {
    const kinds = service.build(forming, asOf).actions.map((a) => a.kind);
    expect(kinds).toContain('opportunity');
    expect(kinds).toContain('introduction');
  });

  it('returns the full plan as plan actions in ready', () => {
    const plan = service.build(ready, asOf);
    expect(plan.actions.map((a) => a.id)).toEqual(plan.steps.map((s) => s.id));
    expect(plan.actions.every((a) => a.kind === 'plan')).toBe(true);
  });

  it('drops action ids that are not in the catalogue', () => {
    const missing = 'certificates-and-inspections-de-immowinkel';
    const partial = {
      keepKnown: (ids: string[]) => catalogue.keepKnown(ids).filter((id) => id !== missing),
      findOne: (id: string) => (id === missing ? undefined : catalogue.findOne(id)),
    } as unknown as CatalogueService;
    const ids = new PlanService(partial).build(whisper, asOf).actions.map((a) => a.id);
    expect(ids).not.toContain(missing);
    expect(ids).toContain('fluvius-meter-data-connection');
  });

  it('reacts to the area from forming on and not in whisper', () => {
    const area = {
      historicCentre: true,
      buildingStockAge: 60,
      openGroupRounds: ['solar-panels-east-flanders-2026', 'nope'],
    };
    const early = service.build({ ...whisper, area }, asOf);
    expect(early.areaNotes).toEqual([]);
    expect(early.groupRounds).toEqual([]);
    const plan = service.build({ ...forming, area }, asOf);
    expect(plan.areaNotes.map((n) => n.id)).toEqual(['historic-centre-home', 'older-homes-nearby']);
    expect(plan.areaNotes[0].facts[0].verified).toBe(false);
    expect(plan.groupRounds.map((r) => r.id)).toEqual(['solar-panels-east-flanders-2026']);
    const quiet = service.build({ ...forming, area: { historicCentre: false, buildingStockAge: 10 } }, asOf);
    expect(quiet.areaNotes).toEqual([]);
    expect(quiet.groupRounds).toEqual([]);
  });

  it('points the matching ready step at an open group round', () => {
    const area = { openGroupRounds: ['solar-panels-east-flanders-2026'] };
    const solar = service
      .build({ ...ready, area }, asOf)
      .steps.find((s) => s.id === 'calculate-solar-panels-and-request-a-quote');
    expect(solar?.groupRoundId).toBe('solar-panels-east-flanders-2026');
  });

  it('returns an empty plan when nothing matches', () => {
    const plan = service.build({}, asOf);
    expect(plan.matches).toEqual([]);
    expect(plan.steps).toEqual([]);
  });

  it('drops candidate ids that are not in the catalogue', () => {
    const missing = 'energy-loan';
    const partial = {
      keepKnown: (ids: string[]) => catalogue.keepKnown(ids).filter((id) => id !== missing),
      findOne: (id: string) => (id === missing ? undefined : catalogue.findOne(id)),
    } as unknown as CatalogueService;
    const ids = new PlanService(partial).build(ready, asOf).steps.map((s) => s.id);
    expect(ids).not.toContain(missing);
    expect(ids).toContain('home-insurance');
  });

  it('serves cached scenarios per stage', () => {
    expect(service.listScenarios().map((s) => s.id)).toEqual(['household-maes', 'bakery-leuven']);
    expect(service.findScenario('household-maes')?.source).toBe('cached');
    expect(service.findScenario('household-maes', 'ready')?.steps.length).toBeGreaterThan(0);
    expect(service.findScenario('bakery-leuven', 'forming')?.steps).toEqual([]);
    expect(service.findScenario('bakery-leuven', 'forming')?.areaNotes.length).toBeGreaterThan(0);
    expect(service.findScenario('nope')).toBeUndefined();
  });
});

describe('data files', () => {
  const catalogue = new CatalogueService();
  const read = <T>(name: string) =>
    JSON.parse(readFileSync(join(__dirname, '..', '..', 'data', name), 'utf8')) as T;

  it('rules reference only catalogue ids unless proposed, and known facts', () => {
    const facts = new Set(read<Fact[]>('facts.json').map((f) => f.id));
    for (const rule of read<Rule[]>('rules.json')) {
      rule.facts.forEach((id) => expect(facts.has(id)).toBe(true));
      for (const c of rule.candidates) {
        if (c.proposed) {
          expect(catalogue.findOne(c.id)).toBeUndefined();
          expect(c.title).toBeTruthy();
        } else {
          expect(catalogue.findOne(c.id)).toBeDefined();
        }
      }
    }
  });

  it('rules carry per-segment windows and allowed actions reference known ids', () => {
    const rules = read<Rule[]>('rules.json');
    expect(rules.map((r) => r.thresholds.whisper)).toEqual([36, 12]);
    for (const rule of rules) {
      for (const list of Object.values(rule.allowedActions)) {
        for (const a of list ?? []) {
          expect(catalogue.findOne(a.id) === undefined).toBe(a.proposed === true);
        }
      }
    }
  });

  it('cached scenarios use catalogue ids unless proposed, and steps only in the ready stage', () => {
    for (const s of read<CachedScenario[]>('scenarios.json')) {
      for (const [stage, plan] of Object.entries(s.plans)) {
        if (stage !== 'ready') expect(plan.steps).toEqual([]);
        if (stage === 'whisper') expect(plan.actions.every((a) => !a.sharesData || a.optional)).toBe(true);
        for (const step of plan.steps) {
          expect(catalogue.findOne(step.id) !== undefined).toBe(!step.proposed);
        }
      }
    }
  });
});
