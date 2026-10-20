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

export interface Area {
  buildingStockAge?: number;
  historicCentre?: boolean;
  openGroupRounds?: string[];
}

export type Decision = 'dismissed' | 'snoozed' | 'accepted';

export interface HistoryEntry {
  intent: string;
  decision: Decision;
  daysAgo: number;
  category?: string;
}

export interface Signals {
  dates: DateSignal[];
  spend: SpendSignal[];
  flags: string[];
  area?: Area;
  history?: HistoryEntry[];
  confirmedIntents?: string[];
}

export type ActionKind = 'awareness' | 'optional' | 'opportunity' | 'introduction' | 'plan';

export interface ActionDef {
  id: string;
  kind: ActionKind;
  why: string;
  optional: boolean;
  sharesData: boolean;
  partnerRole?: string;
  proposed?: boolean;
  title?: string;
}

export interface AreaNoteDef {
  id: string;
  text: string;
  facts: string[];
  historicCentre?: boolean;
  minBuildingStockAge?: number;
}

export interface GroupRound {
  id: string;
  title: string;
  catalogueId: string;
}

export type Condition =
  | { flag: string }
  | { date: string; stage?: Stage }
  | { category: string; minTotal?: number; minCount?: number }
  | { buildingStockAgeAtLeast: number }
  | { historicCentre: boolean };

export interface ScoredSignal {
  id: string;
  label: string;
  weight: number;
  condition: Condition;
}

export interface ConfidenceThresholds {
  low: number;
  high: number;
}

export interface EngineConfig {
  sensitiveCategories: string[];
  cooldownDays: { dismissed: number; snoozed: number };
  snoozeFactor: number;
  categoryMemoryDays: number;
  categoryFactors: { dismissed: number; accepted: number };
  graph: { maxBoost: number; links: { from: string; to: string; weight: number }[] };
}

export interface Evidence {
  signalId: string;
  label: string;
  weight: number;
  contribution: number;
}

export type SuppressedReason = 'low-confidence' | 'cooldown-dismissed';

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
  thresholds: StageThresholds;
  confidence: ConfidenceThresholds;
  signals: ScoredSignal[];
  when: Condition[];
  stages: Partial<Record<Stage, Condition[]>>;
  messages: Record<Stage, string>;
  notes: Record<Stage, string>;
  allowedActions: Partial<Record<Stage, ActionDef[]>>;
  areaNotes: AreaNoteDef[];
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
  windowStage: Stage;
  stage: Stage | null;
  score: number;
  evidence: Evidence[];
  suppressed?: SuppressedReason;
  keyDate?: string;
}

export interface PlanMatch {
  ruleId: string;
  intent: string;
  title: string;
  stage: Stage;
  windowStage: Stage;
  score: number;
  evidence: Evidence[];
  keyDate?: string;
  message: string;
  note: string;
  thresholds: StageThresholds;
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
  groupRoundId?: string;
}

export interface PlanAction {
  id: string;
  kind: ActionKind;
  title: string;
  optional: boolean;
  sharesData: boolean;
  partnerRole?: string;
  proposed: boolean;
  why: string;
  intent: string;
}

export interface PlanSuppressed {
  ruleId: string;
  intent: string;
  reason: SuppressedReason;
  score: number;
  evidence: Evidence[];
}

export interface PlanAreaNote {
  id: string;
  text: string;
  facts: Fact[];
}

export interface Plan {
  scenarioId?: string;
  asOf: string;
  source: 'rules' | 'cached';
  wording: 'deterministic' | 'model';
  matches: PlanMatch[];
  steps: PlanStep[];
  actions: PlanAction[];
  areaNotes: PlanAreaNote[];
  groupRounds: GroupRound[];
  suppressed: PlanSuppressed[];
}

export interface CachedScenario {
  id: string;
  title: string;
  plans: Record<Stage, Plan>;
}
