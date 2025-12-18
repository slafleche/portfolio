import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import {
  getBrevoEnvConfig,
  getRuntimeEnv,
  getTurnstileEnvConfig,
  isHostedEnv,
} from '@/lib/runtimeEnv';

const ORIGINAL_ENV = {
  ...process.env,
} as Record<string, string | undefined>;

function baseEnv(): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = {
    ...ORIGINAL_ENV,
  };
  delete env.NODE_ENV;
  delete env.VERCEL_ENV;
  delete env.VERCEL_GIT_COMMIT_REF;
  delete env.VERCEL_GIT_BRANCH;
  delete env.BRANCH;
  return env;
}

function setEnv(
  overrides: Partial<Record<string, string>>,
): void {
  process.env = {
    ...baseEnv(),
    ...overrides,
  } as NodeJS.ProcessEnv;
}

describe('getRuntimeEnv', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  it('treats non-production NODE_ENV as local, even on Vercel', () => {
    setEnv({
      NODE_ENV: 'development',
      VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_REF: 'release',
    });

    const env = getRuntimeEnv();

    expect(env.nodeEnv).toBe('development');
    expect(env.kind).toBe('local');
    expect(env.hostedTier).toBeNull();
  });

  it('classifies production + VERCEL_ENV=production as hosted release', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_REF: 'release',
    });

    const env = getRuntimeEnv();

    expect(env.nodeEnv).toBe('production');
    expect(env.vercelEnv).toBe('production');
    expect(env.kind).toBe('hosted');
    expect(env.hostedTier).toBe('release');
  });

  it('classifies production preview on staging branch as hosted staging (commit ref)', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'staging',
    });

    const env = getRuntimeEnv();

    expect(env.kind).toBe('hosted');
    expect(env.hostedTier).toBe('staging');
    expect(env.branch).toBe('staging');
  });

  it('classifies production preview on staging branch as hosted staging (git branch)', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      VERCEL_GIT_BRANCH: 'staging',
    });

    const env = getRuntimeEnv();

    expect(env.kind).toBe('hosted');
    expect(env.hostedTier).toBe('staging');
    expect(env.branch).toBe('staging');
  });

  it('classifies production preview on staging branch as hosted staging (BRANCH env)', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      BRANCH: 'staging',
    });

    const env = getRuntimeEnv();

    expect(env.kind).toBe('hosted');
    expect(env.hostedTier).toBe('staging');
    expect(env.branch).toBe('staging');
  });

  it('classifies production preview on non-staging branch as uncharted', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'candidate/feature-1.2.3',
    });

    const env = getRuntimeEnv();

    expect(env.kind).toBe('uncharted');
    expect(env.hostedTier).toBeNull();
    expect(env.branch).toBe('candidate/feature-1.2.3');
  });

  it('classifies production with unknown VERCEL_ENV as uncharted', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'development',
      VERCEL_GIT_COMMIT_REF: 'main',
    });

    const env = getRuntimeEnv();

    expect(env.kind).toBe('uncharted');
    expect(env.hostedTier).toBeNull();
  });

  it('falls back to local when production has no VERCEL_ENV', () => {
    setEnv({
      NODE_ENV: 'production',
    });

    const env = getRuntimeEnv();

    expect(env.kind).toBe('local');
    expect(env.hostedTier).toBeNull();
    expect(env.vercelEnv).toBeUndefined();
  });
});

describe('isHostedEnv', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  it('returns false in local development', () => {
    setEnv({
      NODE_ENV: 'development',
    });

    expect(isHostedEnv()).toBe(false);
    expect(isHostedEnv({ onlyProd: true })).toBe(false);
  });

  it('returns true for hosted staging, but false with onlyProd', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'staging',
    });

    expect(isHostedEnv()).toBe(true);
    expect(isHostedEnv({ onlyProd: true })).toBe(false);
  });

  it('returns true for hosted release, including onlyProd', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_REF: 'release',
    });

    expect(isHostedEnv()).toBe(true);
    expect(isHostedEnv({ onlyProd: true })).toBe(true);
  });

  it('returns false for uncharted environments', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'candidate/try-new-layout-0.1.0',
    });

    expect(isHostedEnv()).toBe(false);
    expect(isHostedEnv({ onlyProd: true })).toBe(false);
  });

  it('returns false when production has no VERCEL_ENV', () => {
    setEnv({
      NODE_ENV: 'production',
    });

    expect(isHostedEnv()).toBe(false);
    expect(isHostedEnv({ onlyProd: true })).toBe(false);
  });
});

describe('getTurnstileEnvConfig', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  it('reads both site and secret keys when present', () => {
    setEnv({
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'public-site-key',
      TURNSTILE_SECRET: 'server-secret-key',
    });

    const cfg = getTurnstileEnvConfig();

    expect(cfg.siteKey).toBe('public-site-key');
    expect(cfg.secretKey).toBe('server-secret-key');
  });

  it('reads only the site key when secret is missing', () => {
    setEnv({
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'public-site-key',
    });

    const cfg = getTurnstileEnvConfig();

    expect(cfg.siteKey).toBe('public-site-key');
    expect(cfg.secretKey).toBeNull();
  });

  it('reads only the secret key when site key is missing', () => {
    setEnv({
      TURNSTILE_SECRET: 'server-secret-key',
    });

    const cfg = getTurnstileEnvConfig();

    expect(cfg.siteKey).toBeNull();
    expect(cfg.secretKey).toBe('server-secret-key');
  });

  it('returns nulls when keys are absent', () => {
    setEnv({});

    const cfg = getTurnstileEnvConfig();

    expect(cfg.siteKey).toBeNull();
    expect(cfg.secretKey).toBeNull();
  });
});

describe('getBrevoEnvConfig', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV } as NodeJS.ProcessEnv;
  });

  it('reads Brevo configuration keys when all are present', () => {
    setEnv({
      BREVO_API_KEY: 'brevo-key',
      MAIL_FROM: 'from@example.com',
      MAIL_TO: 'to@example.com',
      CONTACT_SUBJECT_PREFIX: '[Prefix]',
    });

    const cfg = getBrevoEnvConfig();

    expect(cfg.apiKey).toBe('brevo-key');
    expect(cfg.mailFrom).toBe('from@example.com');
    expect(cfg.mailTo).toBe('to@example.com');
    expect(cfg.subjectPrefix).toBe('[Prefix]');
  });

  it('returns nulls for all Brevo keys when none are set', () => {
    setEnv({});

    const cfg = getBrevoEnvConfig();

    expect(cfg.apiKey).toBeNull();
    expect(cfg.mailFrom).toBeNull();
    expect(cfg.mailTo).toBeNull();
    expect(cfg.subjectPrefix).toBeNull();
  });

  it('handles each Brevo key missing individually', () => {
    const baseEnv = {
      BREVO_API_KEY: 'brevo-key',
      MAIL_FROM: 'from@example.com',
      MAIL_TO: 'to@example.com',
      CONTACT_SUBJECT_PREFIX: '[Prefix]',
    };

    const cases: Array<{
      missingKey: keyof typeof baseEnv;
    }> = [
      { missingKey: 'BREVO_API_KEY' },
      { missingKey: 'MAIL_FROM' },
      { missingKey: 'MAIL_TO' },
      { missingKey: 'CONTACT_SUBJECT_PREFIX' },
    ];

    for (const { missingKey } of cases) {
      const envForCase: Record<string, string> = {};
      for (const [key, value] of Object.entries(baseEnv)) {
        if (key === missingKey) continue;
        envForCase[key] = value;
      }
      setEnv(envForCase);

      const cfg = getBrevoEnvConfig();

      expect(cfg.apiKey).toBe(
        missingKey === 'BREVO_API_KEY' ? null : 'brevo-key',
      );
      expect(cfg.mailFrom).toBe(
        missingKey === 'MAIL_FROM'
          ? null
          : 'from@example.com',
      );
      expect(cfg.mailTo).toBe(
        missingKey === 'MAIL_TO' ? null : 'to@example.com',
      );
      expect(cfg.subjectPrefix).toBe(
        missingKey === 'CONTACT_SUBJECT_PREFIX'
          ? null
          : '[Prefix]',
      );
    }
  });
});
