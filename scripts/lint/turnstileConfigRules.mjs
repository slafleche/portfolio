// Linting rules for Turnstile-related environment usage.
// This file is data-only; scripts/checkRuntimeConfig.mjs owns the scanning logic.

/**
 * @typedef {Object} TurnstileEnvUsagePattern
 * @property {string} id - Stable identifier for this rule.
 * @property {string} description - Human-readable description for error messages.
 * @property {RegExp} regex - Line-level pattern that matches disallowed usage.
 * @property {string[]} [allowedPathSubstrings] - Relative path substrings where this
 *   usage is allowed (for example, the central runtimeEnv helper).
 */

/**
 * Direct Turnstile env usages that should be routed through getTurnstileEnvConfig().
 *
 * @type {TurnstileEnvUsagePattern[]}
 */
export const TURNSTILE_ENV_USAGE_PATTERNS = [
  {
    id: 'turnstile-site-key',
    description:
      'Use getTurnstileEnvConfig() instead of process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY.',
    // Match common direct usages of NEXT_PUBLIC_TURNSTILE_SITE_KEY via
    // process.env, including dot, optional chaining, and bracket access, all
    // at the line level.
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)[^\n]*NEXT_PUBLIC_TURNSTILE_SITE_KEY\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'turnstile-secret-key',
    description:
      'Use getTurnstileEnvConfig() instead of process.env.TURNSTILE_SECRET.',
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)[^\n]*TURNSTILE_SECRET\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'turnstile-env-helper-usage',
    description:
      'Call getTurnstileEnvConfig() only in server/runtime env helpers; pass Turnstile config into components via props.',
    // Match usage of the Turnstile env helper by name, so imports or calls
    // outside approved server / runtimeEnv locations are treated as violations.
    regex: /\bgetTurnstileEnvConfig\b/,
    allowedPathSubstrings: [
      'src/lib/runtimeEnv.ts',
      'src/server/turnstile/verifyTurnstileToken.ts',
      'app/[LOCALE]/(site)/layout.tsx',
      // Meta/runtimeEnv tests and harnesses
      'tests/helpers/runtimeEnvHarness.ts',
      'tests/helpers/runtimeEnv.test.ts',
    ],
  },
];
