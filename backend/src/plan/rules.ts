import { Condition, Rule, RuleMatch, Signals, Stage, StageThresholds } from './plan.types';

export function parseDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date;
}

export function addMonths(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(date.getUTCDate(), lastDay)));
}

// Windows come from the rule, so each segment has its own ladder. Upper bounds are inclusive.
export function stageFor(
  keyDate: Date,
  asOf: Date,
  thresholds: StageThresholds,
): Stage | null {
  if (keyDate < asOf) return null;
  if (keyDate <= addMonths(asOf, thresholds.ready)) return 'ready';
  if (keyDate <= addMonths(asOf, thresholds.forming)) return 'forming';
  if (keyDate <= addMonths(asOf, thresholds.whisper)) return 'whisper';
  return null;
}

function nearestUpcoming(signals: Signals, kind: string, asOf: Date): Date | null {
  let best: Date | null = null;
  for (const s of signals.dates) {
    if (s.kind !== kind) continue;
    const date = parseDate(s.date);
    if (!date || date < asOf) continue;
    if (!best || date < best) best = date;
  }
  return best;
}

// A date condition holds for its stage or any sooner one, so a stage is never skipped.
const RANK: Record<Stage, number> = { ready: 0, forming: 1, whisper: 2 };

function conditionHolds(
  condition: Condition,
  signals: Signals,
  asOf: Date,
  thresholds: StageThresholds,
): boolean {
  if ('flag' in condition) return signals.flags.includes(condition.flag);
  if ('date' in condition) {
    const date = nearestUpcoming(signals, condition.date, asOf);
    if (!date) return false;
    if (condition.stage === undefined) return true;
    const found = stageFor(date, asOf, thresholds);
    return found !== null && RANK[found] <= RANK[condition.stage];
  }
  const rows = signals.spend.filter((s) => s.category === condition.category);
  if (rows.length === 0) return false;
  const total = rows.reduce((sum, s) => sum + s.total, 0);
  const count = rows.reduce((sum, s) => sum + s.count, 0);
  if (condition.minTotal !== undefined && total < condition.minTotal) return false;
  if (condition.minCount !== undefined && count < condition.minCount) return false;
  return true;
}

const LADDER: Stage[] = ['ready', 'forming', 'whisper'];

// A rule matches when its gate holds. Its stage is the highest rung whose conditions all hold.
export function evaluateRules(rules: Rule[], signals: Signals, asOf: Date): RuleMatch[] {
  const matches: RuleMatch[] = [];
  for (const rule of rules) {
    const holds = (c: Condition) => conditionHolds(c, signals, asOf, rule.thresholds);
    if (!rule.when.every(holds)) continue;
    const stage = LADDER.find((st) => {
      const conditions = rule.stages[st];
      return conditions !== undefined && conditions.length > 0 && conditions.every(holds);
    });
    if (!stage) continue;
    const keyDate = rule.keyDate ? nearestUpcoming(signals, rule.keyDate, asOf) : null;
    matches.push({ rule, stage, keyDate: keyDate?.toISOString().slice(0, 10) });
  }
  return matches;
}
