import { WordingConfig } from '../config/config';
import { PlanStep } from './plan.types';

type FetchFn = typeof fetch;

const MAX_WHY = 240;
const TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 64 * 1024;

// Reads the body up to the limit. Returns null when it is larger.
async function readBounded(res: Response): Promise<string | null> {
  const declared = Number(res.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return null;
  if (!res.body) return null;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// Rewrites only the "why" text of steps that already exist. Ids, titles and roles
// never change. Any failure or malformed answer returns the steps untouched.
export async function rewriteWhy(
  steps: PlanStep[],
  config: WordingConfig,
  fetchFn: FetchFn = fetch,
): Promise<{ steps: PlanStep[]; used: boolean }> {
  if (!config.enabled || steps.length === 0) return { steps, used: false };
  try {
    const input = steps.map((s) => ({ id: s.id, title: s.title, why: s.why }));
    const res = await fetchFn(config.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${config.key}` },
      redirect: 'error',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content:
              'Rewrite each "why" as one short, plain sentence for a customer. Keep the meaning. ' +
              'Reply with a JSON object that maps each id to its new sentence and nothing else.',
          },
          { role: 'user', content: JSON.stringify(input) },
        ],
      }),
    });
    if (!res.ok) return { steps, used: false };
    const text = await readBounded(res);
    if (text === null) return { steps, used: false };
    const body = JSON.parse(text) as { choices?: { message?: { content?: string } }[] };
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== 'string') return { steps, used: false };
    const parsed: unknown = JSON.parse(content);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { steps, used: false };
    }
    const wording = new Map(Object.entries(parsed as Record<string, unknown>));
    let changed = false;
    const next = steps.map((step) => {
      const text = wording.get(step.id);
      if (typeof text !== 'string') return step;
      const clean = text.trim();
      if (clean.length === 0 || clean.length > MAX_WHY) return step;
      changed = true;
      return { ...step, why: clean };
    });
    return { steps: next, used: changed };
  } catch {
    return { steps, used: false };
  }
}
