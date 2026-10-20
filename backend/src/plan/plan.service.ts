import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CatalogueService } from '../catalogue/catalogue.service';
import { loadConfig } from '../config/config';
import { PlanRequestDto } from './dto/plan-request.dto';
import {
  CachedScenario,
  Fact,
  Plan,
  PlanStep,
  Rule,
  Stage,
  WatchedItem,
} from './plan.types';
import { evaluateRules, parseDate } from './rules';
import { rewriteWhy } from './wording';

function readData<T>(name: string): T {
  return JSON.parse(readFileSync(join(__dirname, '..', '..', 'data', name), 'utf8')) as T;
}

@Injectable()
export class PlanService {
  private readonly rules = readData<Rule[]>('rules.json');
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
    const asOf = dto.asOf ? (parseDate(dto.asOf) as Date) : (parseDate(today.toISOString().slice(0, 10)) as Date);
    const plan = this.build(dto, asOf);
    const { steps, used } = await rewriteWhy(plan.steps, this.wording);
    return { ...plan, steps, wording: used ? 'model' : 'deterministic' };
  }

  build(dto: Pick<PlanRequestDto, 'scenarioId' | 'dates' | 'spend' | 'flags'>, asOf: Date): Plan {
    const signals = { dates: dto.dates ?? [], spend: dto.spend ?? [], flags: dto.flags ?? [] };
    const matches = evaluateRules(this.rules, signals, asOf);
    const steps: PlanStep[] = [];
    const watching: WatchedItem[] = [];
    const seenSteps = new Set<string>();
    const seenWatched = new Set<string>();

    for (const { rule, stage } of matches) {
      const known = new Set(this.catalogue.keepKnown(rule.candidates.map((c) => c.id)));
      for (const c of rule.candidates) {
        const proposed = c.proposed === true;
        if (proposed ? this.catalogue.findOne(c.id) : !known.has(c.id)) continue;
        const title = proposed ? (c.title ?? c.id) : (this.catalogue.findOne(c.id) as { name: string }).name;
        if (stage !== 'ready') {
          if (!proposed && !c.notNeeded && !seenWatched.has(c.id)) {
            seenWatched.add(c.id);
            watching.push({ id: c.id, title, intent: rule.intent });
          }
          continue;
        }
        if (seenSteps.has(c.id)) continue;
        seenSteps.add(c.id);
        steps.push({
          id: c.id,
          title,
          partnerRole: c.role,
          why: c.why,
          dataUsed: c.dataUsed,
          intent: rule.intent,
          proposed,
          notNeeded: c.notNeeded === true,
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
        keyDate: m.keyDate,
        message: m.rule.messages[m.stage],
        facts: m.rule.facts.flatMap((id) => this.facts.get(id) ?? []),
      })),
      steps,
      watching,
    };
  }

  // Re-applies the catalogue and stage checks to a stored plan before it is served.
  private sanitize(plan: Plan): Plan {
    const stages = new Map(plan.matches.map((m) => [m.intent, m.stage]));
    const steps = plan.steps.filter((s) => {
      if (stages.get(s.intent) !== 'ready') return false;
      return s.proposed ? !this.catalogue.findOne(s.id) : this.catalogue.findOne(s.id) !== undefined;
    });
    const watching = plan.watching.filter((w) => {
      const stage = stages.get(w.intent);
      return stage !== undefined && stage !== 'ready' && this.catalogue.findOne(w.id) !== undefined;
    });
    return { ...plan, source: 'cached', steps, watching };
  }
}
