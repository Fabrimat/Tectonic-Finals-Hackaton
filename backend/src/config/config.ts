export interface AppConfig {
  port: number;
  corsOrigins: string[];
  rateLimitPerMinute: number;
  partnerApiKey: string;
}

function positiveInt(name: string, raw: string | undefined, fallback: number, max: number): number {
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new Error(`Invalid ${name}: expected an integer between 1 and ${max}, got "${raw}"`);
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

  return {
    port: positiveInt('PORT', env.PORT, 3000, 65535),
    corsOrigins,
    rateLimitPerMinute: positiveInt('RATE_LIMIT_PER_MINUTE', env.RATE_LIMIT_PER_MINUTE, 300, 100000),
    partnerApiKey,
  };
}
