export type HostedTier = 'staging' | 'release';

export type RuntimeEnvKind = 'local' | 'hosted' | 'uncharted';

export interface RuntimeEnv {
  nodeEnv: string;
  vercelEnv: string | undefined;
  branch: string | undefined;
  kind: RuntimeEnvKind;
  hostedTier: HostedTier | null;
}

function readBranch(): string | undefined {
  return (
    process.env.VERCEL_GIT_COMMIT_REF ??
    process.env.VERCEL_GIT_BRANCH ??
    process.env.BRANCH ??
    undefined
  );
}

export function getRuntimeEnv(): RuntimeEnv {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const vercelEnv = process.env.VERCEL_ENV;
  const branch = readBranch();

  if (nodeEnv !== 'production') {
    return {
      nodeEnv,
      vercelEnv,
      branch,
      kind: 'local',
      hostedTier: null,
    };
  }

  if (vercelEnv === 'production') {
    return {
      nodeEnv,
      vercelEnv,
      branch,
      kind: 'hosted',
      hostedTier: 'release',
    };
  }

  if (vercelEnv === 'preview') {
    if (branch === 'staging') {
      return {
        nodeEnv,
        vercelEnv,
        branch,
        kind: 'hosted',
        hostedTier: 'staging',
      };
    }

    return {
      nodeEnv,
      vercelEnv,
      branch,
      kind: 'uncharted',
      hostedTier: null,
    };
  }

  return {
    nodeEnv,
    vercelEnv,
    branch,
    kind: vercelEnv ? 'uncharted' : 'local',
    hostedTier: null,
  };
}

export interface IsHostedEnvOptions {
  onlyProd?: boolean;
}

export function isHostedEnv(
  options: IsHostedEnvOptions = {},
): boolean {
  const { onlyProd = false } = options;
  const env = getRuntimeEnv();
  if (env.kind !== 'hosted') {
    return false;
  }
  if (onlyProd) {
    return env.hostedTier === 'release';
  }
  return true;
}

export function isOnlyProd(): boolean {
  return isHostedEnv({ onlyProd: true });
}

export function notProd(): boolean {
  return !isOnlyProd();
}

export interface PrivateLaunchEnvConfig {
  user: string | null;
  password: string | null;
  enabledForStaging: boolean;
  enabledForRelease: boolean;
}

function parsePrivateLaunchFlag(
  value: string | undefined,
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

export function getPrivateLaunchEnvConfig(): PrivateLaunchEnvConfig {
  return {
    user: process.env.PRIVATE_LAUNCH_USER ?? null,
    password: process.env.PRIVATE_LAUNCH_PASSWORD ?? null,
    enabledForStaging: parsePrivateLaunchFlag(
      process.env.PRIVATE_LAUNCH_ENABLED_STAGING,
    ),
    enabledForRelease: parsePrivateLaunchFlag(
      process.env.PRIVATE_LAUNCH_ENABLED_RELEASE,
    ),
  };
}

export interface TurnstileEnvConfig {
  siteKey: string | null;
  secretKey: string | null;
}

export function getTurnstileEnvConfig(): TurnstileEnvConfig {
  return {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null,
    secretKey: process.env.TURNSTILE_SECRET ?? null,
  };
}

export interface BrevoEnvConfig {
  apiKey: string | null;
  mailFrom: string | null;
  mailTo: string | null;
  subjectPrefix: string | null;
  timeoutMs: number | null;
  retryDelayMs: number | null;
  retryJitterMs: number | null;
}

export function getBrevoEnvConfig(): BrevoEnvConfig {
  const parseNumber = (raw: string | undefined): number | null => {
    if (raw == null) return null;
    if (raw.trim() === '') return null;
    const value = Number(raw);
    return Number.isNaN(value) ? null : value;
  };

  const timeout = parseNumber(process.env.BREVO_TIMEOUT_MS);
  const retryDelay = parseNumber(process.env.BREVO_RETRY_DELAY_MS);
  const retryJitter = parseNumber(process.env.BREVO_RETRY_JITTER_MS);

  return {
    apiKey: process.env.BREVO_API_KEY ?? null,
    mailFrom: process.env.MAIL_FROM ?? null,
    mailTo: process.env.MAIL_TO ?? null,
    subjectPrefix: process.env.CONTACT_SUBJECT_PREFIX ?? null,
    timeoutMs: Number.isNaN(timeout) ? null : timeout,
    retryDelayMs: Number.isNaN(retryDelay) ? null : retryDelay,
    retryJitterMs: Number.isNaN(retryJitter) ? null : retryJitter,
  };
}
