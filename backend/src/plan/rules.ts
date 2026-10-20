import {
  Condition,
  EngineConfig,
  Evidence,
  Rule,
  RuleMatch,
  Signals,
  Stage,
  StageThresholds,
} from './plan.types';

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
  if ('buildingStockAgeAtLeast' in condition) {
    return (signals.area?.buildingStockAge ?? 0) >= condition.buildingStockAgeAtLeast;
  }
  if ('historicCentre' in condition) {
    return (signals.area?.historicCentre === true) === condition.historicCentre;
  }
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
const round1 = (n: number) => Math.round(n * 10) / 10;

// Multiplier for a spend category, from what this customer accepted or dismissed before.
function categoryMultiplier(category: string, signals: Signals, engine: EngineConfig): number {
  const recent = (signals.history ?? []).filter(
    (h) => h.category === category && h.daysAgo <= engine.categoryMemoryDays,
  );
  let factor = 1;
  if (recent.some((h) => h.decision === 'dismissed')) factor *= engine.categoryFactors.dismissed;
  if (recent.some((h) => h.decision === 'accepted')) factor *= engine.categoryFactors.accepted;
  return factor;
}

// The time window decides the highest stage. The score decides whether the card is shown at all:
// below `low` nothing, between `low` and `high` whisper only, from `high` as the window says.
export function evaluateRules(
  rules: Rule[],
  input: Signals,
  asOf: Date,
  engine: EngineConfig,
): RuleMatch[] {
  const sensitive = new Set(engine.sensitiveCategories);
  const signals: Signals = { ...input, spend: input.spend.filter((s) => !sensitive.has(s.category)) };
  const matches: RuleMatch[] = [];

  for (const rule of rules) {
    const holds = (c: Condition) => conditionHolds(c, signals, asOf, rule.thresholds);
    if (!rule.when.every(holds)) continue;
    const windowStage = LADDER.find((st) => {
      const conditions = rule.stages[st];
      return conditions !== undefined && conditions.length > 0 && conditions.every(holds);
    });
    if (!windowStage) continue;
    const keyDate = rule.keyDate ? nearestUpcoming(signals, rule.keyDate, asOf) : null;
    const base = { rule, windowStage, keyDate: keyDate?.toISOString().slice(0, 10) };

    const history = (signals.history ?? []).filter((h) => h.intent === rule.intent);
    if (history.some((h) => h.decision === 'dismissed' && h.daysAgo < engine.cooldownDays.dismissed)) {
      matches.push({ ...base, stage: null, score: 0, evidence: [], suppressed: 'cooldown-dismissed' });
      continue;
    }

    const evidence: Evidence[] = [];
    for (const s of rule.signals) {
      if (!holds(s.condition)) continue;
      const category = 'category' in s.condition ? s.condition.category : undefined;
      const factor = category ? categoryMultiplier(category, signals, engine) : 1;
      evidence.push({
        signalId: s.id,
        label: s.label,
        weight: s.weight,
        contribution: round1(s.weight * factor),
      });
    }
    let score = evidence.reduce((sum, e) => sum + e.contribution, 0);

    if (history.some((h) => h.decision === 'snoozed' && h.daysAgo < engine.cooldownDays.snoozed)) {
      const cut = -round1(score * engine.snoozeFactor);
      evidence.push({ signalId: 'history-snoozed', label: 'Snoozed recently', weight: 0, contribution: cut });
      score += cut;
    }

    const confirmed = signals.confirmedIntents ?? [];
    const links = engine.graph.links.filter((l) => l.to === rule.intent && confirmed.includes(l.from));
    if (links.length > 0) {
      const room = Math.max(0, rule.confidence.high - 1 - score);
      const wanted = Math.min(
        engine.graph.maxBoost,
        links.reduce((sum, l) => sum + l.weight, 0),
      );
      // A link alone never lifts a customer into the full stage.
      const boost = score < rule.confidence.high ? Math.min(wanted, room) : wanted;
      if (boost > 0) {
        evidence.push({
          signalId: 'link-' + links.map((l) => l.from).join('+'),
          label: 'Linked intent confirmed',
          weight: wanted,
          contribution: round1(boost),
        });
        score += boost;
      }
    }

    score = Math.round(Math.min(100, Math.max(0, score)));
    if (score < rule.confidence.low) {
      matches.push({ ...base, stage: null, score, evidence, suppressed: 'low-confidence' });
    } else if (score < rule.confidence.high) {
      matches.push({ ...base, stage: 'whisper', score, evidence });
    } else {
      matches.push({ ...base, stage: windowStage, score, evidence });
    }
  }
  return matches;
}
