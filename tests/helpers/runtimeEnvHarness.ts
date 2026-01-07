import {
  getBrevoEnvConfig,
  getTurnstileEnvConfig,
  isHostedEnv,
} from '@/lib/runtimeEnv';

import { buildTestEnv } from './testEnvVars';

export type EnvOverrides = Record<string, string>;

/**
 * Apply a set of environment overrides for the duration of a
 * synchronous test function, restoring the original environment
 * afterwards.
 *
 * This helper is intentionally synchronous; use it for code paths
 * where env variables are read eagerly (for example, runtimeEnv
 * helpers).
 */
export function withEnvOverrides<T>(
  overrides: EnvOverrides,
  fn: () => T,
): T {
  const original = { ...process.env };
  try {
    process.env = buildTestEnv(overrides) as NodeJS.ProcessEnv;
    return fn();
  } finally {
    process.env = original;
  }
}

/**
 * Apply environment overrides for the duration of a test and return a
 * restore function. This is useful for asynchronous flows where env
 * must stay overridden across multiple awaits.
 */
export function installEnvOverrides(
  overrides: EnvOverrides,
): () => void {
  const original = { ...process.env } as NodeJS.ProcessEnv;
  process.env = buildTestEnv(overrides) as NodeJS.ProcessEnv;

  return () => {
    process.env = original;
  };
}

export {
  getBrevoEnvConfig,
  getTurnstileEnvConfig,
  isHostedEnv,
};
