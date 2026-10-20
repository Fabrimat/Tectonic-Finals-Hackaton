import { BadRequestException, Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CatalogueService } from '../catalogue/catalogue.service';
import { loadConfig } from '../config/config';
import { PlanRequestDto } from './dto/plan-request.dto';
import {
  ActionDef,
  ActionKind,
  Area,
  CachedScenario,
  EngineConfig,
  Fact,
  GroupRound,
  Plan,
  PlanAction,
  PlanStep,
  Rule,
  Stage,
} from './plan.types';
import { evaluateRules, parseDate } from './rules';
import { rewriteWhy } from './wording';

// Kinds of action each stage may carry. Whisper stays awareness and customer-initiated actions.
const KINDS_BY_STAGE: Record<Stage, ActionKind[]> = {
  whisper: ['awareness', 'optional'],
  forming: ['awareness', 'optional', 'opportunity', 'introduction'],
  ready: ['awareness', 'optional', 'opportunity', 'introduction', 'plan'],
};

function readData<T>(name: string): T {
  return JSON.parse(readFileSync(join(__dirname, '..', '..', 'data', name), 'utf8')) as T;
}

@Injectable()
export class PlanService {
  private readonly rules = readData<Rule[]>('rules.json');
  private readonly engine = readData<EngineConfig>('engine.json');
  private readonly rounds = readData<GroupRound[]>('group-rounds.json');
  private readonly facts = new Map(readData<Fact[]>('facts.json').map((f) => [f.id, f]));
  private readonly scenarios: CachedScenario[];
  private readonly wording = loadConfig().wording;

  constructor(private readonly catalogue: CatalogueService) {
    this.scenarios = readData<CachedScenario[]>('scenarios.json').map((s) => ({
      ...s,
      plans: {
        whisper: this.sanitize(s.plans.whisper),
        forming: this.sanitize(s.plans.forming),
        ready: this.sanitize(s.plans.ready),
      },
    }));
  }

  listScenarios(): { id: string; title: string; stages: Stage[] }[] {
    return this.scenarios.map(({ id, title }) => ({ id, title, stages: ['whisper', 'forming', 'ready'] }));
  }

  findScenario(id: string, stage: Stage = 'ready'): Plan | undefined {
    return this.scenarios.find((s) => s.id === id)?.plans[stage];
  }

  async create(dto: PlanRequestDto, today: Date = new Date()): Promise<Plan> {
    const raw = dto.asOf ?? today.toISOString().slice(0, 10);
    const asOf = parseDate(raw);
    if (!asOf) throw new BadRequestException('asOf must be a valid date in YYYY-MM-DD format');
    const plan = this.build(dto, asOf);
    const { steps, used } = await rewriteWhy(plan.steps, this.wording);
    return { ...plan, steps, wording: used ? 'model' : 'deterministic' };
  }

  build(
    dto: Pick<PlanRequestDto, 'scenarioId' | 'dates' | 'spend' | 'flags' | 'area' | 'history' | 'confirmedIntents'>,
    asOf: Date,
  ): Plan {
    const area: Area = dto.area ?? {};
    const signals = {
      dates: dto.dates ?? [],
      spend: dto.spend ?? [],
      flags: dto.flags ?? [],
      area,
      history: dto.history ?? [],
      confirmedIntents: dto.confirmedIntents ?? [],
    };
    const evaluated = evaluateRules(this.rules, signals, asOf, this.engine);
    const matches = evaluated.flatMap((m) => (m.stage ? [{ ...m, stage: m.stage }] : []));
    const suppressed = evaluated.flatMap((m) =>
      m.suppressed
        ? [{ ruleId: m.rule.id, intent: m.rule.intent, reason: m.suppressed, score: m.score, evidence: m.evidence }]
        : [],
    );
    const steps: PlanStep[] = [];
    const actions: PlanAction[] = [];
    const areaNotes: Plan['areaNotes'] = [];
    const groupRounds: GroupRound[] = [];
    const seenSteps = new Set<string>();
    const seenActions = new Set<string>();

    for (const { rule, stage } of matches) {
      const open = this.rounds.filter(
        (r) =>
          (area.openGroupRounds ?? []).includes(r.id) &&
          (rule.candidates.some((c) => c.id === r.catalogueId) ||
            Object.values(rule.allowedActions).some((list) => list?.some((a) => a.id === r.catalogueId))),
      );
      if (stage !== 'whisper') {
        for (const r of open) if (!groupRounds.some((g) => g.id === r.id)) groupRounds.push(r);
        for (const note of rule.areaNotes) {
          const applies =
            (note.historicCentre === undefined || note.historicCentre === (area.historicCentre === true)) &&
            (note.minBuildingStockAge === undefined || (area.buildingStockAge ?? 0) >= note.minBuildingStockAge);
          if (applies && !areaNotes.some((n) => n.id === note.id)) {
            areaNotes.push({ id: note.id, text: note.text, facts: this.factsFor(note.facts) });
          }
        }
      }

      for (const def of rule.allowedActions[stage] ?? []) {
        const action = this.toAction(def, rule.intent, stage);
        if (action && !seenActions.has(action.id)) {
          seenActions.add(action.id);
          actions.push(action);
        }
      }

      if (stage !== 'ready') continue;
      const known = new Set(this.catalogue.keepKnown(rule.candidates.map((c) => c.id)));
      for (const c of rule.candidates) {
        const proposed = c.proposed === true;
        if (proposed ? this.catalogue.findOne(c.id) : !known.has(c.id)) continue;
        if (seenSteps.has(c.id)) continue;
        seenSteps.add(c.id);
        const title = proposed ? (c.title ?? c.id) : (this.catalogue.findOne(c.id) as { name: string }).name;
        const round = open.find((r) => r.catalogueId === c.id);
        steps.push({
          id: c.id,
          title,
          partnerRole: c.role,
          why: c.why,
          dataUsed: c.dataUsed,
          intent: rule.intent,
          proposed,
          notNeeded: c.notNeeded === true,
          ...(round ? { groupRoundId: round.id } : {}),
        });
        actions.push({
          id: c.id,
          kind: 'plan',
          title,
          optional: true,
          sharesData: c.notNeeded !== true,
          partnerRole: c.role,
          proposed,
          why: c.why,
          intent: rule.intent,
        });
      }
    }

    return {
      scenarioId: dto.scenarioId,
      asOf: asOf.toISOString().slice(0, 10),
      source: 'rules',
      wording: 'deterministic',
      matches: matches.map((m) => ({
        ruleId: m.rule.id,
        intent: m.rule.intent,
        title: m.rule.title,
        stage: m.stage,
        windowStage: m.windowStage,
        score: m.score,
        evidence: m.evidence,
        keyDate: m.keyDate,
        message: m.rule.messages[m.stage],
        note: m.rule.notes[m.stage],
        thresholds: m.rule.thresholds,
        facts: this.factsFor(m.rule.facts),
      })),
      steps,
      actions,
      areaNotes,
      groupRounds,
      suppressed,
    };
  }

  private factsFor(ids: string[]): Fact[] {
    return ids.flatMap((id) => this.facts.get(id) ?? []);
  }

  // Validates an action against the catalogue and the stage gating. Returns null when it is not allowed.
  private toAction(def: ActionDef, intent: string, stage: Stage): PlanAction | null {
    if (!KINDS_BY_STAGE[stage].includes(def.kind)) return null;
    if (def.sharesData && !def.optional) return null;
    const proposed = def.proposed === true;
    const product = this.catalogue.findOne(def.id);
    if (proposed ? product : !product) return null;
    return {
      id: def.id,
      kind: def.kind,
      title: proposed ? (def.title ?? def.id) : (product as { name: string }).name,
      optional: def.optional,
      sharesData: def.sharesData,
      ...(def.partnerRole ? { partnerRole: def.partnerRole } : {}),
      proposed,
      why: def.why,
      intent,
    };
  }

  // Re-applies the catalogue and stage checks to a stored plan before it is served.
  private sanitize(plan: Plan): Plan {
    const stages = new Map(plan.matches.map((m) => [m.intent, m.stage]));
    const exists = (id: string, proposed: boolean) =>
      proposed ? !this.catalogue.findOne(id) : this.catalogue.findOne(id) !== undefined;
    const steps = plan.steps.filter((s) => stages.get(s.intent) === 'ready' && exists(s.id, s.proposed));
    const actions = plan.actions.filter((a) => {
      const stage = stages.get(a.intent);
      if (!stage || !KINDS_BY_STAGE[stage].includes(a.kind) || !exists(a.id, a.proposed)) return false;
      if (stage !== 'ready' && a.sharesData && !a.optional) return false;
      return a.kind !== 'plan' || steps.some((s) => s.id === a.id);
    });
    const hasMatch = (stage: Stage) => plan.matches.some((m) => m.stage === stage);
    const late = hasMatch('forming') || hasMatch('ready');
    return {
      ...plan,
      source: 'cached',
      steps,
      actions,
      areaNotes: late ? plan.areaNotes : [],
      groupRounds: late ? plan.groupRounds.filter((r) => this.rounds.some((k) => k.id === r.id)) : [],
      suppressed: plan.suppressed ?? [],
    };
  }
}
