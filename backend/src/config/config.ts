import { join } from 'path';

export interface AppConfig {
  port: number;
  corsOrigins: string[];
  rateLimitPerMinute: number;
  partnerApiKey: string;
  staticDir: string;
  trustProxy: number;
  wording: WordingConfig;
}

export interface WordingConfig {
  enabled: boolean;
  url: string;
  key: string;
  model: string;
}

function positiveInt(name: string, raw: string | undefined, fallback: number, max: number): number {
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new Error(`Invalid ${name}: expected an integer between 1 and ${max}, got "${raw}"`);
  }
  return value;
}

function proxyHops(raw: string | undefined): number {
  if (raw === undefined || raw === '' || raw === 'false') return 0;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    throw new Error(`Invalid TRUST_PROXY: expected a number of proxy hops between 0 and 10, got "${raw}"`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const corsOrigins = (env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (corsOrigins.length === 0) throw new Error('CORS_ORIGINS must contain at least one origin');
  for (const origin of corsOrigins) {
    try {
      new URL(origin);
    } catch {
      throw new Error(`Invalid CORS_ORIGINS entry: "${origin}"`);
    }
  }

  const partnerApiKey = env.PARTNER_API_KEY ?? '';
  if (partnerApiKey.length < 24 || partnerApiKey.startsWith('replace-with')) {
    throw new Error('PARTNER_API_KEY must be set to a random value of at least 24 characters');
  }

  const wording: WordingConfig = {
    enabled: env.PLAN_WORDING_ENABLED === 'true',
    url: env.PLAN_WORDING_URL ?? '',
    key: env.PLAN_WORDING_KEY ?? '',
    model: env.PLAN_WORDING_MODEL ?? '',
  };
  if (wording.enabled) {
    if (!wording.key || !wording.model) {
      throw new Error('PLAN_WORDING_KEY and PLAN_WORDING_MODEL are required when PLAN_WORDING_ENABLED=true');
    }
    let parsed: URL | undefined;
    try {
      parsed = new URL(wording.url);
    } catch {
      parsed = undefined;
    }
    if (!parsed || parsed.protocol !== 'https:') {
      throw new Error('PLAN_WORDING_URL must be a valid https URL when PLAN_WORDING_ENABLED=true');
    }
  }

  return {
    port: positiveInt('PORT', env.PORT, 3000, 65535),
    corsOrigins,
    rateLimitPerMinute: positiveInt('RATE_LIMIT_PER_MINUTE', env.RATE_LIMIT_PER_MINUTE, 300, 100000),
    partnerApiKey,
    staticDir: env.STATIC_DIR || join(__dirname, '..', '..', '..', 'frontend', 'dist'),
    trustProxy: proxyHops(env.TRUST_PROXY),
    wording,
  };
}
