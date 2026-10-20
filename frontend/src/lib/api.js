const sent = new Set();

export async function postIntent(scenarioId, step) {
  const { intent } = step;
  if (!intent) return "skipped";
  const id = `${scenarioId}:${step.id}`;
  if (sent.has(id)) return "sent";
  try {
    const res = await fetch("/api/intents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        scenarioId,
        stepId: step.id,
        service: intent.service,
        region: intent.region,
        timeframe: intent.timeframe,
        budgetBand: intent.budgetBand,
      }),
    });
    if (!res.ok) return "local";
    sent.add(id);
    return "sent";
  } catch {
    return "local";
  }
}

// A new run can post its intents again.
export function forgetSent() {
  sent.clear();
}

// Resolves to { status: "ok", intents } or { status: "nokey" | "denied" | "offline" }.
export async function fetchIntents(key) {
  if (!key) return { status: "nokey" };
  try {
    const res = await fetch("/api/intents", { headers: { "x-api-key": key } });
    if (res.status === 401) return { status: "denied" };
    if (!res.ok) return { status: "offline" };
    const intents = await res.json();
    return { status: "ok", intents: Array.isArray(intents) ? intents : [] };
  } catch {
    return { status: "offline" };
  }
}

const KEY_SLOT = "ripple-demo-access";

export function readAccessKey() {
  try {
    return sessionStorage.getItem(KEY_SLOT) ?? "";
  } catch {
    return "";
  }
}

export function writeAccessKey(value) {
  try {
    if (value) sessionStorage.setItem(KEY_SLOT, value);
    else sessionStorage.removeItem(KEY_SLOT);
  } catch {
    // session storage can be blocked, the key then lives only in the field
  }
}
