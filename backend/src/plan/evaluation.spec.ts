import { readFileSync } from 'fs';
import { join } from 'path';
import { EngineConfig, Rule, Signals, Stage } from './plan.types';
import { evaluateRules, parseDate } from './rules';

type Label = Stage | 'none';

interface Customer {
  id: string;
  segment: 'household' | 'business';
  label: Label;
  signals: Signals;
}

const read = <T>(name: string) =>
  JSON.parse(readFileSync(join(__dirname, '..', '..', 'data', name), 'utf8')) as T;

const rules = read<Rule[]>('rules.json');
const engine = read<EngineConfig>('engine.json');
const customers = read<Customer[]>('eval-customers.json');
const ruleFor = { household: 'home-renovation-clock', business: 'business-vans-and-premises' };
const labels: Label[] = ['none', 'whisper', 'forming', 'ready'];
const asOf = parseDate('2026-10-20') as Date;

function predict(c: Customer): Label {
  const rule = rules.find((r) => r.id === ruleFor[c.segment]) as Rule;
  const [match] = evaluateRules([rule], c.signals, asOf, engine);
  return match?.stage ?? 'none';
}

// These numbers compare the rules with synthetic labels drawn by scripts/generate-eval.js.
// They show the rules are internally consistent, not how they would perform on real customers.
describe('evaluation on synthetic customers', () => {
  const rows = customers.map((c) => ({ truth: c.label, predicted: predict(c) }));
  const count = (truth: Label, predicted: Label) =>
    rows.filter((r) => r.truth === truth && r.predicted === predicted).length;
  const precision = (stage: Label) => {
    const predicted = rows.filter((r) => r.predicted === stage).length;
    return predicted === 0 ? 0 : count(stage, stage) / predicted;
  };
  const recall = (stage: Label) => {
    const actual = rows.filter((r) => r.truth === stage).length;
    return actual === 0 ? 0 : count(stage, stage) / actual;
  };

  it('prints the confusion summary', () => {
    const lines = ['', `customers: ${rows.length} (rows are true, columns are predicted)`];
    lines.push(['true\\pred', ...labels].map((l) => l.padEnd(10)).join(''));
    for (const truth of labels) {
      lines.push([truth, ...labels.map((p) => String(count(truth, p)))].map((l) => l.padEnd(10)).join(''));
    }
    for (const stage of labels.slice(1)) {
      lines.push(`${stage}: precision ${precision(stage).toFixed(2)}, recall ${recall(stage).toFixed(2)}`);
    }
    console.log(lines.join('\n'));
    expect(rows.length).toBeGreaterThanOrEqual(60);
  });

  it('keeps precision and recall above the stated thresholds at ready and forming', () => {
    expect(precision('ready')).toBeGreaterThanOrEqual(0.8);
    expect(recall('ready')).toBeGreaterThanOrEqual(0.7);
    expect(precision('forming')).toBeGreaterThanOrEqual(0.7);
    expect(recall('forming')).toBeGreaterThanOrEqual(0.6);
  });

  it('rarely shows anything to customers with no intent', () => {
    const none = rows.filter((r) => r.truth === 'none');
    const shown = none.filter((r) => r.predicted !== 'none').length;
    expect(shown / none.length).toBeLessThanOrEqual(0.2);
  });
});

interface NoisyCustomer extends Customer {
  withoutSensitive: Signals;
}

const noisyCustomers = read<NoisyCustomer[]>('eval-noisy.json');

// Same generator, harder data: contradictory signals, missing and unparseable dates, dates on
// the window edges and one day either side, sensitive rows, duplicates and decision history.
// Labels come from the generator's own definition of the true stage, not from the engine.
describe('evaluation on the noisy synthetic set', () => {
  const rows = noisyCustomers.map((c) => ({ truth: c.label, predicted: predict(c) }));
  const count = (truth: Label, predicted: Label) =>
    rows.filter((r) => r.truth === truth && r.predicted === predicted).length;
  const precision = (stage: Label) => {
    const predicted = rows.filter((r) => r.predicted === stage).length;
    return predicted === 0 ? 0 : count(stage, stage) / predicted;
  };
  const recall = (stage: Label) => {
    const actual = rows.filter((r) => r.truth === stage).length;
    return actual === 0 ? 0 : count(stage, stage) / actual;
  };

  it('prints the noisy set confusion summary', () => {
    const lines = ['', `noisy set, customers: ${rows.length} (rows are true, columns are predicted)`];
    lines.push(['true\\pred', ...labels].map((l) => l.padEnd(10)).join(''));
    for (const truth of labels) {
      lines.push([truth, ...labels.map((p) => String(count(truth, p)))].map((l) => l.padEnd(10)).join(''));
    }
    for (const stage of labels.slice(1)) {
      lines.push(`${stage}: precision ${precision(stage).toFixed(2)}, recall ${recall(stage).toFixed(2)}`);
    }
    console.log(lines.join('\n'));
    expect(rows.length).toBeGreaterThanOrEqual(300);
  });

  it('holds conservative thresholds on the noisy set', () => {
    // Recall is low on purpose: missing dates and flags leave the engine too little to go on.
    expect(precision('ready')).toBeGreaterThanOrEqual(0.9);
    expect(precision('forming')).toBeGreaterThanOrEqual(0.9);
    expect(recall('ready')).toBeGreaterThanOrEqual(0.35);
    expect(recall('forming')).toBeGreaterThanOrEqual(0.35);
    const none = rows.filter((r) => r.truth === 'none');
    expect(none.filter((r) => r.predicted !== 'none').length / none.length).toBeLessThanOrEqual(0.1);
  });

  it('predicts the same with and without the sensitive rows', () => {
    const sensitive = new Set(['health', 'medical', 'pharmacy', 'religion', 'political', 'union', 'gambling', 'adult']);
    const withRows = noisyCustomers.filter((c) => c.signals.spend.some((s) => sensitive.has(s.category)));
    expect(withRows.length).toBeGreaterThanOrEqual(50);
    for (const c of withRows) {
      expect(predict(c)).toBe(predict({ ...c, signals: c.withoutSensitive }));
    }
  });
});
