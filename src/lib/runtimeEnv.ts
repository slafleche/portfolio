import {
  isDev,
  isRelease,
  isStaging,
  notDev,
  notRelease,
  notStaging,
} from '../config/envPrimitives';

export {
  isDev,
  isRelease,
  isStaging,
  notDev,
  notRelease,
  notStaging,
};

export type RuntimeNodeEnv = 'development' | 'production';

type StorybookConfigType = 'PRODUCTION' | 'DEVELOPMENT';

const readStorybookConfigType = (): StorybookConfigType | null => {
  const value = (globalThis as unknown as Record<string, unknown>)
    .CONFIG_TYPE;
  if (value === 'PRODUCTION') return 'PRODUCTION';
  if (value === 'DEVELOPMENT') return 'DEVELOPMENT';
  return null;
};

export function getRuntimeNodeEnv(): RuntimeNodeEnv {
  const configType = readStorybookConfigType();
  if (configType === 'PRODUCTION') return 'production';
  if (configType === 'DEVELOPMENT') return 'development';

  return isDev() ? 'development' : 'production';
}

export function getSiteOrigin(): string | null {
  const raw = process.env.SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      return null;
    }
  }
  if (isRelease()) {
    return 'https://lafleche.dev';
  }
  if (isStaging()) {
    return 'https://staging.lafleche.dev';
  }
  return null;
}

function parsePrivateLaunchFlag(
  value: string | undefined | null,
): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return (
    normalized === '1' ||
    normalized === 'true' ||
    normalized === 'yes' ||
    normalized === 'on'
  );
}

const parseNumber = (raw: string | undefined): number | null => {
  if (raw == null) return null;
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isNaN(value) ? null : value;
};

export function isHostedEnv(): boolean {
  return isStaging() || isRelease();
}

export function notHosted(): boolean {
  return !isHostedEnv();
}

export interface PrivateLaunchEnvConfig {
  user?: string | null;
  password?: string | null;
  isPrivateOnStaging: boolean;
  isPrivateOnRelease: boolean;
  isPrivateOnLocal: boolean;
}

export function getPrivateLaunchEnvConfig(): PrivateLaunchEnvConfig {
  const env = process.env as PasswordProtectionEnv;

  return {
    user: env.PRIVATE_LAUNCH_USER ?? null,
    password: env.PRIVATE_LAUNCH_PASSWORD ?? null,

    isPrivateOnStaging: parsePrivateLaunchFlag(env.PRIVATE_STAGING),
    isPrivateOnRelease: parsePrivateLaunchFlag(env.PRIVATE_RELEASE),
    isPrivateOnLocal: parsePrivateLaunchFlag(env.PRIVATE_LOCAL),
  };
}

export interface TurnstileEnvConfig {
  siteKey: string | null;
  secretKey: string | null;
}

export function getTurnstileEnvConfig(): TurnstileEnvConfig {
  const env = process.env as TurnstileEnv;

  return {
    siteKey: env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null,
    secretKey: env.TURNSTILE_SECRET ?? null,
  };
}

export function getTurnstileSiteKey(): string | null {
  const { siteKey } = getTurnstileEnvConfig();
  return siteKey ?? null;
}

export function getChromaticProjectToken(): string | null {
  const raw = process.env.CHROMATIC_PROJECT_TOKEN?.trim();
  return raw ? raw : null;
}

export interface BrevoEnvConfig {
  apiKey: string | null;
  mailFrom: string | null;
  mailTo: string | null;
  subjectPrefix: string | null;
  timeoutMs: number | null;
  retryDelayMs: number | null;
  retryJitterMs: number | null;
  healthTimeoutMs: number | null;
}

export function getBrevoEnvConfig(): BrevoEnvConfig {
  const env = process.env as ContactFormEnv;

  const timeout = parseNumber(env.BREVO_TIMEOUT_MS);
  const retryDelay = parseNumber(env.BREVO_RETRY_DELAY_MS);
  const retryJitter = parseNumber(env.BREVO_RETRY_JITTER_MS);
  const healthTimeout = parseNumber(env.BREVO_HEALTH_TIMEOUT_MS);

  return {
    apiKey: env.BREVO_API_KEY ?? null,
    mailFrom: env.MAIL_FROM ?? null,
    mailTo: env.MAIL_TO ?? null,
    subjectPrefix: env.CONTACT_SUBJECT_PREFIX ?? null,
    timeoutMs: Number.isNaN(timeout) ? null : timeout,
    retryDelayMs: Number.isNaN(retryDelay) ? null : retryDelay,
    retryJitterMs: Number.isNaN(retryJitter) ? null : retryJitter,
    healthTimeoutMs: Number.isNaN(healthTimeout)
      ? null
      : healthTimeout,
  };
}

// Indexing control
export interface IndexingEnvConfig {
  allowIndexing: string | null;
}

export function getIndexingEnvConfig(): IndexingEnvConfig {
  const env = process.env as IndexingEnv;
  return {
    allowIndexing: env.ALLOW_INDEXING ?? null,
  };
}

export type ManifestTarget = '_staging' | 'release';

export function getManifestTarget(): ManifestTarget {
  if (isRelease()) return 'release';
  const env =
    typeof process !== 'undefined'
      ? (process.env as { LOCAL_MANIFEST_TARGET?: string })
      : (
          globalThis as {
            process?: { env?: { LOCAL_MANIFEST_TARGET?: string } };
          }
        ).process?.env;
  const raw = env?.LOCAL_MANIFEST_TARGET?.trim();
  if (raw === 'release') return 'release';
  if (raw === '_staging') return '_staging';
  return '_staging';
}

export function isIndexingAllowed(): boolean {
  const privatePermissions = getPrivateLaunchEnvConfig();

  // Never allow indexing if we're not in production as an extra safety measure
  if (notRelease()) {
    return false;
  }

  // Never allow indexing if private launch is enabled on release
  if (privatePermissions.isPrivateOnRelease) {
    return false;
  }

  // If we're on release and not private, check the indexing flag
  const indexingPermissions = getIndexingEnvConfig();
  return parsePrivateLaunchFlag(indexingPermissions.allowIndexing);
}
