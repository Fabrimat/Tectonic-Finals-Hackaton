export type Stage = 'whisper' | 'forming' | 'ready';

export interface StageThresholds {
  ready: number;
  forming: number;
  whisper: number;
}

export interface DateSignal {
  kind: string;
  date: string;
}

export interface SpendSignal {
  category: string;
  total: number;
  count: number;
}

export interface Signals {
  dates: DateSignal[];
  spend: SpendSignal[];
  flags: string[];
}

export type Condition =
  | { flag: string }
  | { date: string; stage?: Stage }
  | { category: string; minTotal?: number; minCount?: number };

export interface Candidate {
  id: string;
  role: string;
  why: string;
  dataUsed: string[];
  proposed?: boolean;
  notNeeded?: boolean;
  title?: string;
}

export interface Rule {
  id: string;
  intent: string;
  title: string;
  keyDate?: string;
  thresholds?: StageThresholds;
  when: Condition[];
  stages: Partial<Record<Stage, Condition[]>>;
  messages: Record<Stage, string>;
  facts: string[];
  candidates: Candidate[];
}

export interface Fact {
  id: string;
  text: string;
  source: string;
  verified: boolean;
}

export interface RuleMatch {
  rule: Rule;
  stage: Stage;
  keyDate?: string;
}

export interface PlanMatch {
  ruleId: string;
  intent: string;
  title: string;
  stage: Stage;
  keyDate?: string;
  message: string;
  facts: Fact[];
}

export interface PlanStep {
  id: string;
  title: string;
  partnerRole: string;
  why: string;
  dataUsed: string[];
  intent: string;
  proposed: boolean;
  notNeeded: boolean;
}

export interface WatchedItem {
  id: string;
  title: string;
  intent: string;
}

export interface Plan {
  scenarioId?: string;
  asOf: string;
  source: 'rules' | 'cached';
  wording: 'deterministic' | 'model';
  matches: PlanMatch[];
  steps: PlanStep[];
  watching: WatchedItem[];
}

export interface CachedScenario {
  id: string;
  title: string;
  plans: Record<Stage, Plan>;
}
