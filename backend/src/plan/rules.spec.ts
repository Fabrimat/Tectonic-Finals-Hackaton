import { evaluateRules, parseDate, stageFor } from './rules';
import { EngineConfig, Rule, Signals } from './plan.types';

const d = (value: string) => parseDate(value) as Date;
const asOf = d('2026-10-20');
const household = { ready: 3, forming: 12, whisper: 36 };
const business = { ready: 3, forming: 6, whisper: 12 };
const engine: EngineConfig = {
  sensitiveCategories: [],
  cooldownDays: { dismissed: 90, snoozed: 30 },
  snoozeFactor: 0.5,
  categoryMemoryDays: 180,
  categoryFactors: { dismissed: 0.5, accepted: 1.1 },
  graph: { maxBoost: 10, links: [] },
};

describe('stageFor', () => {
  it.each([
    ['2026-10-20', 'ready'],
    ['2027-01-20', 'ready'],
    ['2027-01-21', 'forming'],
    ['2027-10-20', 'forming'],
    ['2027-10-21', 'whisper'],
    ['2029-10-20', 'whisper'],
  ])('household: %s is %s', (date, stage) => {
    expect(stageFor(d(date), asOf, household)).toBe(stage);
  });

  it.each([
    ['2027-01-20', 'ready'],
    ['2027-01-21', 'forming'],
    ['2027-04-20', 'forming'],
    ['2027-04-21', 'whisper'],
    ['2027-10-20', 'whisper'],
  ])('business: %s is %s', (date, stage) => {
    expect(stageFor(d(date), asOf, business)).toBe(stage);
  });

  it('the same date lands in different stages per segment', () => {
    expect(stageFor(d('2027-08-01'), asOf, household)).toBe('forming');
    expect(stageFor(d('2027-08-01'), asOf, business)).toBe('whisper');
  });

  it('returns null for past dates and dates beyond three years', () => {
    expect(stageFor(d('2026-10-19'), asOf, household)).toBeNull();
    expect(stageFor(d('2029-10-21'), asOf, household)).toBeNull();
    expect(stageFor(d('2027-10-21'), asOf, business)).toBeNull();
  });

  it('honours custom thresholds', () => {
    expect(stageFor(d('2026-12-20'), asOf, { ready: 1, forming: 3, whisper: 6 })).toBe('forming');
  });

  it('clamps month ends', () => {
    const thresholds = { ready: 3, forming: 6, whisper: 12 };
    expect(stageFor(d('2026-02-28'), d('2025-11-30'), thresholds)).toBe('ready');
  });
});

describe('parseDate', () => {
  it('rejects malformed and impossible dates', () => {
    expect(parseDate('2026-02-30')).toBeNull();
    expect(parseDate('20-10-2026')).toBeNull();
    expect(parseDate('2026-10-20')).not.toBeNull();
  });
});

describe('evaluateRules', () => {
  const rule: Rule = {
    id: 'r1',
    intent: 'test-intent',
    title: 'Test',
    keyDate: 'deadline',
    thresholds: household,
    confidence: { low: 0, high: 0 },
    signals: [],
    when: [{ flag: 'gate' }],
    stages: {
      whisper: [{ date: 'deadline', stage: 'whisper' }],
      forming: [{ date: 'deadline', stage: 'forming' }, { category: 'fuel', minTotal: 500, minCount: 2 }],
      ready: [{ flag: 'invoice' }],
    },
    messages: { whisper: 'w', forming: 'f', ready: 'r' },
    notes: { whisper: 'w', forming: 'f', ready: 'r' },
    allowedActions: {},
    areaNotes: [],
    facts: [],
    candidates: [],
  };
  const signals = (over: Partial<Signals> = {}): Signals => ({
    dates: [{ kind: 'deadline', date: '2028-01-01' }],
    spend: [],
    flags: ['gate'],
    ...over,
  });

  it('places a far date in the whisper stage', () => {
    const [match] = evaluateRules([rule], signals(), asOf, engine);
    expect(match.stage).toBe('whisper');
    expect(match.keyDate).toBe('2028-01-01');
  });

  it('does not match without the gate', () => {
    expect(evaluateRules([rule], signals({ flags: [] }), asOf, engine)).toEqual([]);
  });

  it('does not match when no rung holds', () => {
    expect(evaluateRules([rule], signals({ dates: [] }), asOf, engine)).toEqual([]);
    expect(evaluateRules([rule], signals({ dates: [{ kind: 'deadline', date: '2031-01-01' }] }), asOf, engine)).toEqual([]);
  });

  it('needs every condition of a rung', () => {
    const dates = [{ kind: 'deadline', date: '2027-05-01' }];
    expect(evaluateRules([rule], signals({ dates }), asOf, engine)[0].stage).toBe('whisper');
    const spend = [{ category: 'fuel', total: 600, count: 4 }];
    expect(evaluateRules([rule], signals({ dates, spend }), asOf, engine)[0].stage).toBe('forming');
    const low = [{ category: 'fuel', total: 499, count: 4 }];
    expect(evaluateRules([rule], signals({ dates, spend: low }), asOf, engine)[0].stage).toBe('whisper');
    const few = [{ category: 'fuel', total: 900, count: 1 }];
    expect(evaluateRules([rule], signals({ dates, spend: few }), asOf, engine)[0].stage).toBe('whisper');
  });

  it('sums rows of the same category', () => {
    const dates = [{ kind: 'deadline', date: '2027-05-01' }];
    const spend = [
      { category: 'fuel', total: 300, count: 1 },
      { category: 'fuel', total: 300, count: 1 },
    ];
    expect(evaluateRules([rule], signals({ dates, spend }), asOf, engine)[0].stage).toBe('forming');
  });

  it('takes the highest rung that holds', () => {
    const [match] = evaluateRules([rule], signals({ flags: ['gate', 'invoice'] }), asOf, engine);
    expect(match.stage).toBe('ready');
  });

  it('uses the nearest upcoming date of a kind and ignores past ones', () => {
    const dates = [
      { kind: 'deadline', date: '2026-01-01' },
      { kind: 'deadline', date: '2029-01-01' },
      { kind: 'deadline', date: '2028-02-01' },
    ];
    const [match] = evaluateRules([rule], signals({ dates }), asOf, engine);
    expect(match.keyDate).toBe('2028-02-01');
  });

  it('uses rule thresholds when present', () => {
    const custom: Rule = { ...rule, thresholds: { ready: 1, forming: 2, whisper: 3 } };
    expect(evaluateRules([custom], signals(), asOf, engine)).toEqual([]);
  });

  it('a date condition holds for its stage or a sooner one', () => {
    const r: Rule = { ...rule, stages: { whisper: [{ date: 'deadline', stage: 'whisper' }] } };
    const near = [{ kind: 'deadline', date: '2026-12-01' }];
    expect(evaluateRules([r], signals({ dates: near }), asOf, engine)[0].stage).toBe('whisper');
  });
});
