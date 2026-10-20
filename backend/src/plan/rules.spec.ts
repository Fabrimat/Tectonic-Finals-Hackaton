import { evaluateRules, parseDate, stageFor } from './rules';
import { Rule, Signals } from './plan.types';

const d = (value: string) => parseDate(value) as Date;
const asOf = d('2026-10-20');

describe('stageFor', () => {
  it.each([
    ['2026-10-20', 'ready'],
    ['2027-01-20', 'ready'],
    ['2027-01-21', 'forming'],
    ['2027-10-20', 'forming'],
    ['2027-10-21', 'whisper'],
    ['2029-10-20', 'whisper'],
  ])('%s is %s', (date, stage) => {
    expect(stageFor(d(date), asOf)).toBe(stage);
  });

  it('returns null for past dates and dates beyond three years', () => {
    expect(stageFor(d('2026-10-19'), asOf)).toBeNull();
    expect(stageFor(d('2029-10-21'), asOf)).toBeNull();
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
    when: [{ flag: 'gate' }],
    stages: {
      whisper: [{ date: 'deadline', stage: 'whisper' }],
      forming: [{ date: 'deadline', stage: 'forming' }, { category: 'fuel', minTotal: 500, minCount: 2 }],
      ready: [{ flag: 'invoice' }],
    },
    messages: { whisper: 'w', forming: 'f', ready: 'r' },
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
    const [match] = evaluateRules([rule], signals(), asOf);
    expect(match.stage).toBe('whisper');
    expect(match.keyDate).toBe('2028-01-01');
  });

  it('does not match without the gate', () => {
    expect(evaluateRules([rule], signals({ flags: [] }), asOf)).toEqual([]);
  });

  it('does not match when no rung holds', () => {
    expect(evaluateRules([rule], signals({ dates: [] }), asOf)).toEqual([]);
    expect(evaluateRules([rule], signals({ dates: [{ kind: 'deadline', date: '2031-01-01' }] }), asOf)).toEqual([]);
  });

  it('needs every condition of a rung', () => {
    const dates = [{ kind: 'deadline', date: '2027-05-01' }];
    expect(evaluateRules([rule], signals({ dates }), asOf)).toEqual([]);
    const spend = [{ category: 'fuel', total: 600, count: 4 }];
    expect(evaluateRules([rule], signals({ dates, spend }), asOf)[0].stage).toBe('forming');
    const low = [{ category: 'fuel', total: 499, count: 4 }];
    expect(evaluateRules([rule], signals({ dates, spend: low }), asOf)).toEqual([]);
    const few = [{ category: 'fuel', total: 900, count: 1 }];
    expect(evaluateRules([rule], signals({ dates, spend: few }), asOf)).toEqual([]);
  });

  it('sums rows of the same category', () => {
    const dates = [{ kind: 'deadline', date: '2027-05-01' }];
    const spend = [
      { category: 'fuel', total: 300, count: 1 },
      { category: 'fuel', total: 300, count: 1 },
    ];
    expect(evaluateRules([rule], signals({ dates, spend }), asOf)[0].stage).toBe('forming');
  });

  it('takes the highest rung that holds', () => {
    const [match] = evaluateRules([rule], signals({ flags: ['gate', 'invoice'] }), asOf);
    expect(match.stage).toBe('ready');
  });

  it('uses the nearest upcoming date of a kind and ignores past ones', () => {
    const dates = [
      { kind: 'deadline', date: '2026-01-01' },
      { kind: 'deadline', date: '2029-01-01' },
      { kind: 'deadline', date: '2028-02-01' },
    ];
    const [match] = evaluateRules([rule], signals({ dates }), asOf);
    expect(match.keyDate).toBe('2028-02-01');
  });

  it('uses rule thresholds when present', () => {
    const custom: Rule = { ...rule, thresholds: { ready: 1, forming: 2, whisper: 3 } };
    expect(evaluateRules([custom], signals(), asOf)).toEqual([]);
  });
});
