import { readFileSync } from 'fs';
import { join } from 'path';
import { CatalogueService } from '../catalogue/catalogue.service';
import { PlanService } from './plan.service';
import { CachedScenario, Fact, Rule } from './plan.types';
import { parseDate } from './rules';

process.env.PARTNER_API_KEY ??= 'test-key-0123456789abcdef-test';

const asOf = parseDate('2026-10-20') as Date;
const whisper = { flags: ['epc_e_or_f'], dates: [{ kind: 'renovation_deadline', date: '2029-06-15' }] };
const forming = { ...whisper, dates: [...whisper.dates, { kind: 'boiler_end_of_life', date: '2027-03-01' }] };
const ready = { ...forming, flags: [...whisper.flags, 'boiler_repair_invoice'] };

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
    expect(plan.watching.length).toBeGreaterThan(0);
    expect(plan.watching.some((w) => w.id === 'heat-pump-installation')).toBe(false);
    expect(plan.watching.some((w) => w.id === 'calculate-a-home-battery-and-request-a-quote')).toBe(false);
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

  it('cached scenarios use catalogue ids unless proposed, and steps only in the ready stage', () => {
    for (const s of read<CachedScenario[]>('scenarios.json')) {
      for (const [stage, plan] of Object.entries(s.plans)) {
        if (stage !== 'ready') expect(plan.steps).toEqual([]);
        for (const step of plan.steps) {
          expect(catalogue.findOne(step.id) !== undefined).toBe(!step.proposed);
        }
      }
    }
  });
});
