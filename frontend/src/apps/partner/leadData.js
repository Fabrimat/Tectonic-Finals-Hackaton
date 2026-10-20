import { canShare, scenarios, viewOf } from "../../data/scenarios.js";

function hash(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function reference(scenarioId, stepId) {
  const code = hash(`${scenarioId}:${stepId}`).toString(16).toUpperCase().slice(-4).padStart(4, "0");
  return `LD-${code}`;
}

export function partnersOf(scenario) {
  if (!canShare(scenario)) return [];
  const seen = new Map();
  for (const step of scenario.steps) {
    if (step.partner && step.intent && !seen.has(step.partner.name)) {
      seen.set(step.partner.name, step.partner);
    }
  }
  return [...seen.values()];
}

// Only the intent fields cross this boundary, nothing about the person.
export function leadsFor(scenario, decisions, confirmed) {
  if (!confirmed || !canShare(scenario)) return [];
  return scenario.steps
    .filter((s) => s.partner && s.intent && decisions[s.id] === "accepted")
    .map((s) => ({
      id: s.id,
      ref: reference(scenario.id, s.id),
      partner: s.partner.name,
      service: s.intent.service,
      region: s.intent.region,
      timeframe: s.intent.timeframe,
      band: s.intent.budgetBand,
    }));
}

function readyStepsOf() {
  return scenarios.flatMap((base) => viewOf(base, "ready").steps.map((step) => ({ scenarioId: base.id, step })));
}

export function allPartners() {
  const seen = new Map();
  for (const { step } of readyStepsOf()) {
    if (step.partner && step.intent && !seen.has(step.partner.name)) seen.set(step.partner.name, step.partner);
  }
  return [...seen.values()];
}

// Turns server intents into lead rows. An intent whose step is not in the local content is dropped.
export function leadsFromIntents(intents) {
  const known = readyStepsOf();
  const leads = [];
  for (const intent of intents) {
    const match = known.find((k) => k.scenarioId === intent.scenarioId && k.step.id === intent.stepId);
    if (!match || !match.step.partner) continue;
    leads.push({
      id: intent.stepId,
      ref: intent.reference,
      partner: match.step.partner.name,
      service: intent.service,
      region: intent.region,
      timeframe: intent.timeframe,
      band: intent.budgetBand,
    });
  }
  return leads;
}
