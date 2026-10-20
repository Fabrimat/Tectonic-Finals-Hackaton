import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CatalogueService } from '../catalogue/catalogue.service';
import { PlanService } from './plan.service';
import { EngineConfig, Rule, Signals } from './plan.types';
import { evaluateRules, parseDate } from './rules';

process.env.PARTNER_API_KEY ??= randomBytes(24).toString('hex');

const read = <T>(name: string) =>
  JSON.parse(readFileSync(join(__dirname, '..', '..', 'data', name), 'utf8')) as T;
const rules = read<Rule[]>('rules.json');
const engine = read<EngineConfig>('engine.json');
const asOf = parseDate('2026-10-20') as Date;

const home = rules.find((r) => r.id === 'home-renovation-clock') as Rule;
const bakery = rules.find((r) => r.id === 'business-vans-and-premises') as Rule;

const base = (over: Partial<Signals> = {}): Signals => ({
  dates: [{ kind: 'renovation_deadline', date: '2029-06-15' }],
  spend: [],
  flags: ['epc_e_or_f'],
  ...over,
});
const strong = (over: Partial<Signals> = {}): Signals =>
  base({
    flags: ['epc_e_or_f', 'energy_bill_rising', 'energy_pages_visited', 'boiler_repair_invoice'],
    dates: [
      { kind: 'renovation_deadline', date: '2029-06-15' },
      { kind: 'boiler_end_of_life', date: '2027-03-01' },
    ],
    ...over,
  });

// No dates, so only the listed flags count towards the score.
const lean = (flags: string[]) => base({ dates: [], flags });

describe('confidence score and evidence', () => {
  it('adds up weighted signals and lists each one as evidence', () => {
    const [m] = evaluateRules([home], strong(), asOf, engine);
    expect(m.stage).toBe('ready');
    expect(m.score).toBe(85);
    expect(m.evidence.map((e) => e.signalId)).toEqual([
      'deadline-window',
      'bill-rising',
      'boiler-old',
      'energy-pages',
      'repair-invoice',
    ]);
    expect(m.evidence.reduce((sum, e) => sum + e.contribution, 0)).toBe(m.score);
    expect(m.evidence.every((e) => e.label.length > 0 && e.weight > 0)).toBe(true);
  });

  it('weights in the data sum to 100 for every rule', () => {
    for (const rule of rules) {
      expect(rule.signals.reduce((sum, s) => sum + s.weight, 0)).toBe(100);
    }
  });

  it('shows nothing below the low threshold and says why', () => {
    const only = lean(['epc_e_or_f', 'boiler_repair_invoice']);
    const [m] = evaluateRules([home], only, asOf, engine);
    expect(m.windowStage).toBe('ready');
    expect(m.stage).toBeNull();
    expect(m.suppressed).toBe('low-confidence');
  });

  it('shows only whisper between the thresholds even when the window says ready', () => {
    const mid = lean(['epc_e_or_f', 'boiler_repair_invoice', 'energy_bill_rising', 'energy_pages_visited']);
    const [m] = evaluateRules([home], mid, asOf, engine);
    expect(m.windowStage).toBe('ready');
    expect(m.score).toBeGreaterThanOrEqual(home.confidence.low);
    expect(m.score).toBeLessThan(home.confidence.high);
    expect(m.stage).toBe('whisper');
  });

  it('uses thresholds per segment', () => {
    expect(home.confidence).toEqual(bakery.confidence);
    const custom: Rule = { ...home, confidence: { low: 90, high: 95 } };
    const [m] = evaluateRules([custom], strong(), asOf, engine);
    expect(m.stage).toBeNull();
  });

  it('returns score, evidence and suppressed reasons in the plan', () => {
    const service = new PlanService(new CatalogueService());
    const shown = service.build(strong(), asOf);
    expect(shown.matches[0].score).toBe(85);
    expect(shown.matches[0].evidence.length).toBe(5);
    expect(shown.suppressed).toEqual([]);
    const hidden = service.build(lean(['epc_e_or_f', 'boiler_repair_invoice']), asOf);
    expect(hidden.matches).toEqual([]);
    expect(hidden.steps).toEqual([]);
    expect(hidden.suppressed[0]).toMatchObject({ intent: 'home-energy-renovation', reason: 'low-confidence' });
  });
});

describe('damping from history', () => {
  it('suppresses an intent dismissed within the cooldown', () => {
    const history = [{ intent: 'home-energy-renovation', decision: 'dismissed' as const, daysAgo: 89 }];
    const [m] = evaluateRules([home], strong({ history }), asOf, engine);
    expect(m.stage).toBeNull();
    expect(m.suppressed).toBe('cooldown-dismissed');
  });

  it('shows the intent again once the cooldown has passed', () => {
    const history = [{ intent: 'home-energy-renovation', decision: 'dismissed' as const, daysAgo: 90 }];
    expect(evaluateRules([home], strong({ history }), asOf, engine)[0].stage).toBe('ready');
  });

  it('ignores history about other intents', () => {
    const history = [{ intent: 'something-else', decision: 'dismissed' as const, daysAgo: 1 }];
    expect(evaluateRules([home], strong({ history }), asOf, engine)[0].stage).toBe('ready');
  });

  it('lowers the score of a snoozed intent and records it as evidence', () => {
    const history = [{ intent: 'home-energy-renovation', decision: 'snoozed' as const, daysAgo: 5 }];
    const [m] = evaluateRules([home], strong({ history }), asOf, engine);
    expect(m.score).toBe(43);
    expect(m.stage).toBe('whisper');
    expect(m.evidence.at(-1)).toMatchObject({ signalId: 'history-snoozed' });
    const [later] = evaluateRules(
      [home],
      strong({ history: [{ intent: 'home-energy-renovation', decision: 'snoozed', daysAgo: 30 }] }),
      asOf,
      engine,
    );
    expect(later.score).toBe(85);
  });

  it('lowers the weight of a rejected category and raises an accepted one slightly', () => {
    const deposit = (history: Signals['history']) =>
      evaluateRules(
        [bakery],
        {
          dates: [{ kind: 'van_replacement_due', date: '2027-01-05' }],
          spend: [{ category: 'vehicle_deposit', total: 2500, count: 1 }],
          flags: ['energy_cost_rising', 'delivery_vans_in_brussels_zone'],
          history,
        },
        asOf,
        engine,
      )[0];
    const find = (id: string, m: ReturnType<typeof deposit>) => m.evidence.find((e) => e.signalId === id);
    expect(find('vehicle-deposit', deposit([]))?.contribution).toBe(20);
    const rejected = deposit([{ intent: 'x', decision: 'dismissed', daysAgo: 10, category: 'vehicle_deposit' }]);
    expect(find('vehicle-deposit', rejected)?.contribution).toBe(10);
    const accepted = deposit([{ intent: 'x', decision: 'accepted', daysAgo: 10, category: 'vehicle_deposit' }]);
    expect(find('vehicle-deposit', accepted)?.contribution).toBe(22);
    const old = deposit([{ intent: 'x', decision: 'dismissed', daysAgo: 400, category: 'vehicle_deposit' }]);
    expect(find('vehicle-deposit', old)?.contribution).toBe(20);
  });
});

describe('sensitive categories', () => {
  const sensitiveRule: Rule = {
    ...home,
    when: [],
    stages: { ready: [{ category: 'health', minCount: 1 }] },
    signals: [{ id: 'health-spend', label: 'Health spending', weight: 100, condition: { category: 'health' } }],
  };

  it('ignores rows in sensitive categories, so they never match or score', () => {
    const spend = [{ category: 'health', total: 900, count: 12 }];
    expect(engine.sensitiveCategories).toContain('health');
    expect(evaluateRules([sensitiveRule], base({ spend }), asOf, engine)).toEqual([]);
  });

  it('keeps sensitive rows out of the plan output', () => {
    const service = new PlanService(new CatalogueService());
    const spend = [
      { category: 'health', total: 900, count: 12 },
      { category: 'religion', total: 50, count: 2 },
      { category: 'fuel', total: 300, count: 4 },
    ];
    const plain = service.build(strong(), asOf);
    const withRows = service.build(strong({ spend }), asOf);
    expect(withRows).toEqual(plain);
    const text = JSON.stringify(withRows);
    expect(text).not.toMatch(/health|religion/);
  });
});

describe('graph boost', () => {
  const confirmed = ['business-energy-and-fleet'];
  const weak = () => lean(['epc_e_or_f', 'boiler_repair_invoice', 'energy_bill_rising']);

  it('adds a bounded boost for a linked confirmed intent', () => {
    const [plain] = evaluateRules([home], weak(), asOf, engine);
    const [boosted] = evaluateRules([home], { ...weak(), confirmedIntents: confirmed }, asOf, engine);
    expect(boosted.score).toBe(plain.score + 8);
    expect(boosted.evidence.at(-1)).toMatchObject({ label: 'Linked intent confirmed', contribution: 8 });
  });

  it('never lifts a customer into the full stage on its own', () => {
    const near = lean(['epc_e_or_f', 'boiler_repair_invoice', 'energy_bill_rising', 'energy_pages_visited']);
    const [plain] = evaluateRules([home], near, asOf, engine);
    expect(plain.score).toBe(40);
    const [boosted] = evaluateRules([home], { ...near, confirmedIntents: confirmed }, asOf, engine);
    expect(boosted.score).toBe(48);
    const bigEngine: EngineConfig = {
      ...engine,
      graph: { maxBoost: 30, links: [{ from: 'business-energy-and-fleet', to: 'home-energy-renovation', weight: 30 }] },
    };
    const [capped] = evaluateRules([home], { ...near, confirmedIntents: confirmed }, asOf, bigEngine);
    expect(capped.score).toBe(home.confidence.high - 1);
    expect(capped.stage).toBe('whisper');
  });

  it('never shows an intent whose own window does not match', () => {
    const noWindow = { dates: [], spend: [], flags: ['epc_e_or_f'], confirmedIntents: confirmed };
    expect(evaluateRules([home], noWindow, asOf, engine)).toEqual([]);
  });

  it('caps the total boost', () => {
    const wide: EngineConfig = {
      ...engine,
      graph: {
        maxBoost: 10,
        links: [
          { from: 'a', to: 'home-energy-renovation', weight: 8 },
          { from: 'b', to: 'home-energy-renovation', weight: 8 },
        ],
      },
    };
    const [plain] = evaluateRules([home], weak(), asOf, wide);
    const [boosted] = evaluateRules([home], { ...weak(), confirmedIntents: ['a', 'b'] }, asOf, wide);
    expect(boosted.score).toBe(plain.score + 10);
  });

  it('does not mark anything as confirmed', () => {
    const service = new PlanService(new CatalogueService());
    const plan = service.build({ ...weak(), confirmedIntents: confirmed }, asOf);
    expect(plan.matches[0].stage).not.toBe('ready');
    expect(plan.steps).toEqual([]);
  });
});
