import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getBrevoEnvConfig,
  getManifestTarget,
  getPrivateLaunchEnvConfig,
  getTurnstileEnvConfig,
  isHostedEnv,
  isIndexingAllowed,
} from '@/lib/runtimeEnv';

import { buildTestEnv, installTestEnv } from './testEnvVars';

let restoreEnv: (() => void) | null = null;

function setEnv(overrides: Partial<Record<string, string>>): void {
  process.env = buildTestEnv(overrides) as NodeJS.ProcessEnv;
}

describe('isHostedEnv', () => {
  beforeEach(() => {
    restoreEnv = installTestEnv();
  });

  afterEach(() => {
    restoreEnv?.();
    restoreEnv = null;
  });

  it('returns false in local development', () => {
    setEnv({
      NODE_ENV: 'development',
    });

    expect(isHostedEnv()).toBe(false);
  });

  it('returns false for local production without Vercel flags', () => {
    setEnv({
      NODE_ENV: 'production',
    });

    expect(isHostedEnv()).toBe(false);
  });

  it('returns true for Vercel preview', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL: '1',
      VERCEL_ENV: 'preview',
    });

    expect(isHostedEnv()).toBe(true);
  });

  it('returns true for Vercel production', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL: '1',
      VERCEL_ENV: 'production',
    });

    expect(isHostedEnv()).toBe(true);
  });

  it('returns false for Vercel development', () => {
    setEnv({
      NODE_ENV: 'development',
      VERCEL: '1',
      VERCEL_ENV: 'development',
    });

    expect(isHostedEnv()).toBe(false);
  });
});

describe('getTurnstileEnvConfig', () => {
  beforeEach(() => {
    restoreEnv = installTestEnv();
  });

  afterEach(() => {
    restoreEnv?.();
    restoreEnv = null;
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

describe('getManifestTarget', () => {
  beforeEach(() => {
    restoreEnv = installTestEnv();
  });

  afterEach(() => {
    restoreEnv?.();
    restoreEnv = null;
  });

  it('returns release when isRelease is true', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL: '1',
      VERCEL_ENV: 'production',
      LOCAL_MANIFEST_TARGET: '_staging',
    });

    expect(getManifestTarget()).toBe('release');
  });

  it('honors LOCAL_MANIFEST_TARGET release when set', () => {
    setEnv({
      NODE_ENV: 'development',
      LOCAL_MANIFEST_TARGET: 'release',
    });

    expect(getManifestTarget()).toBe('release');
  });

  it('honors LOCAL_MANIFEST_TARGET _staging when set', () => {
    setEnv({
      NODE_ENV: 'development',
      LOCAL_MANIFEST_TARGET: '_staging',
    });

    expect(getManifestTarget()).toBe('_staging');
  });

  it('defaults to _staging when not set', () => {
    setEnv({
      NODE_ENV: 'development',
    });

    expect(getManifestTarget()).toBe('_staging');
  });
});

describe('getBrevoEnvConfig', () => {
  beforeEach(() => {
    restoreEnv = installTestEnv();
  });

  afterEach(() => {
    restoreEnv?.();
    restoreEnv = null;
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
      for (const [
        key,
        value,
      ] of Object.entries(baseEnv)) {
        if (key === missingKey) continue;
        envForCase[key] = value;
      }
      setEnv(envForCase);

      const cfg = getBrevoEnvConfig();

      expect(cfg.apiKey).toBe(
        missingKey === 'BREVO_API_KEY' ? null : 'brevo-key',
      );
      expect(cfg.mailFrom).toBe(
        missingKey === 'MAIL_FROM' ? null : 'from@example.com',
      );
      expect(cfg.mailTo).toBe(
        missingKey === 'MAIL_TO' ? null : 'to@example.com',
      );
      expect(cfg.subjectPrefix).toBe(
        missingKey === 'CONTACT_SUBJECT_PREFIX' ? null : '[Prefix]',
      );
    }
  });

  it('normalizes Brevo timeout-related env vars to numbers or null', () => {
    setEnv({
      BREVO_API_KEY: 'brevo-key',
      MAIL_FROM: 'from@example.com',
      MAIL_TO: 'to@example.com',
      CONTACT_SUBJECT_PREFIX: '[Prefix]',
      BREVO_TIMEOUT_MS: '5000',
      BREVO_RETRY_DELAY_MS: '350',
      BREVO_RETRY_JITTER_MS: '0',
      BREVO_HEALTH_TIMEOUT_MS: '4000',
    });

    const cfg = getBrevoEnvConfig();

    expect(cfg.timeoutMs).toBe(5000);
    expect(cfg.retryDelayMs).toBe(350);
    expect(cfg.retryJitterMs).toBe(0);
    expect(cfg.healthTimeoutMs).toBe(4000);
  });

  it('treats missing or invalid Brevo timeout-related env vars as null', () => {
    setEnv({
      BREVO_API_KEY: 'brevo-key',
      MAIL_FROM: 'from@example.com',
      MAIL_TO: 'to@example.com',
      CONTACT_SUBJECT_PREFIX: '[Prefix]',
      BREVO_TIMEOUT_MS: '',
      BREVO_RETRY_DELAY_MS: 'not-a-number',
    });

    const cfg = getBrevoEnvConfig();

    expect(cfg.timeoutMs).toBeNull();
    expect(cfg.retryDelayMs).toBeNull();
    expect(cfg.retryJitterMs).toBeNull();
    expect(cfg.healthTimeoutMs).toBeNull();
  });
});

describe('getPrivateLaunchEnvConfig and isIndexingAllowed', () => {
  beforeEach(() => {
    restoreEnv = installTestEnv();
  });

  afterEach(() => {
    restoreEnv?.();
    restoreEnv = null;
  });

  it('normalizes private-launch flags and credentials from env', () => {
    setEnv({
      PRIVATE_LAUNCH_USER: 'user',
      PRIVATE_LAUNCH_PASSWORD: 'secret',
      PRIVATE_STAGING: '1',
      PRIVATE_RELEASE: '0',
      PRIVATE_LOCAL: 'yes',
    });

    const {
      user,
      password,
      isPrivateOnStaging,
      isPrivateOnRelease,
      isPrivateOnLocal,
    } = getPrivateLaunchEnvConfig();

    expect(user).toBe('user');
    expect(password).toBe('secret');
    expect(isPrivateOnStaging).toBe(true);
    expect(isPrivateOnRelease).toBe(false);
    expect(isPrivateOnLocal).toBe(true);
  });

  it('never allows indexing outside release', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL: '1',
      VERCEL_ENV: 'preview', // staging
      PRIVATE_RELEASE: '0',
      ALLOW_INDEXING: '1',
    });

    expect(isIndexingAllowed()).toBe(false);
  });

  it('never allows indexing on private release', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL: '1',
      VERCEL_ENV: 'production', // release
      PRIVATE_RELEASE: '1',
      ALLOW_INDEXING: '1',
    });

    expect(isIndexingAllowed()).toBe(false);
  });

  it('allows indexing only on non-private release when ALLOW_INDEXING is truthy', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL: '1',
      VERCEL_ENV: 'production', // release
      PRIVATE_RELEASE: '0',
      ALLOW_INDEXING: '1',
    });

    expect(isIndexingAllowed()).toBe(true);
  });

  it('disallows indexing on non-private release when ALLOW_INDEXING is falsy', () => {
    setEnv({
      NODE_ENV: 'production',
      VERCEL: '1',
      VERCEL_ENV: 'production', // release
      PRIVATE_RELEASE: '0',
      ALLOW_INDEXING: '0',
    });

    expect(isIndexingAllowed()).toBe(false);
  });
});
