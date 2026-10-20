import { WordingConfig } from '../config/config';
import { PlanStep } from './plan.types';
import { rewriteWhy } from './wording';

const steps: PlanStep[] = [
  { id: 'energy-loan', title: 'Energy loan', partnerRole: 'Finance', why: 'Base text', dataUsed: [], intent: 'x', proposed: false, notNeeded: false },
];
const on: WordingConfig = { enabled: true, url: 'https://example.test/v1/chat', key: 'secret-value', model: 'm' };
const reply = (content: string) =>
  jest.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content } }] }) });

describe('rewriteWhy', () => {
  it('does not call out when disabled', async () => {
    const fetchFn = jest.fn();
    const out = await rewriteWhy(steps, { ...on, enabled: false }, fetchFn);
    expect(out).toEqual({ steps, used: false });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('falls back when the request fails', async () => {
    const out = await rewriteWhy(steps, on, jest.fn().mockRejectedValue(new Error('network')));
    expect(out).toEqual({ steps, used: false });
  });

  it('falls back on a non-ok response', async () => {
    const out = await rewriteWhy(steps, on, jest.fn().mockResolvedValue({ ok: false }));
    expect(out).toEqual({ steps, used: false });
  });

  it('falls back on an answer that is not JSON', async () => {
    const out = await rewriteWhy(steps, on, reply('not json'));
    expect(out).toEqual({ steps, used: false });
  });

  it('applies new text by id and ignores unknown ids and long text', async () => {
    const out = await rewriteWhy(steps, on, reply(JSON.stringify({ 'energy-loan': 'New text', ghost: 'x' })));
    expect(out.used).toBe(true);
    expect(out.steps).toEqual([{ ...steps[0], why: 'New text' }]);

    const long = await rewriteWhy(steps, on, reply(JSON.stringify({ 'energy-loan': 'x'.repeat(500) })));
    expect(long).toEqual({ steps, used: false });
  });

  it('sends the key only in the authorization header', async () => {
    const fetchFn = reply('{}');
    await rewriteWhy(steps, on, fetchFn);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe(on.url);
    expect(init.headers.authorization).toBe('Bearer secret-value');
    expect(init.body).not.toContain('secret-value');
  });
});
