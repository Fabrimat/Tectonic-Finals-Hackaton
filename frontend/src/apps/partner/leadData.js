function hash(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function reference(scenarioId, stepId) {
  const code = hash(`${scenarioId}:${stepId}`).toString(16).toUpperCase().slice(-4).padStart(4, "0");
  return `RPL-${code}`;
}

export function partnersOf(scenario) {
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
  if (!confirmed) return [];
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
