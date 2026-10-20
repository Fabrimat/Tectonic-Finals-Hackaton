import { randomBytes } from 'crypto';
import { loadConfig } from './config';

const base = { PARTNER_API_KEY: randomBytes(24).toString('hex') };
const wording = { PLAN_WORDING_ENABLED: 'true', PLAN_WORDING_KEY: 'k', PLAN_WORDING_MODEL: 'm' };

describe('loadConfig wording', () => {
  it('accepts an https wording url', () => {
    const config = loadConfig({ ...base, ...wording, PLAN_WORDING_URL: 'https://models.example.com/v1/chat' });
    expect(config.wording.enabled).toBe(true);
  });

  it('rejects an http or malformed wording url', () => {
    expect(() => loadConfig({ ...base, ...wording, PLAN_WORDING_URL: 'http://models.example.com' })).toThrow('https');
    expect(() => loadConfig({ ...base, ...wording, PLAN_WORDING_URL: 'not a url' })).toThrow('https');
  });

  it('does not check the url while wording is off', () => {
    expect(() => loadConfig({ ...base, PLAN_WORDING_URL: 'http://models.example.com' })).not.toThrow();
  });
});
