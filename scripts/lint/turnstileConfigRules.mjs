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
    // process.env, including:
    // - process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    // - process?.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    // - process.env?.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    // - process?.env?.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    // - process.env['NEXT_PUBLIC_TURNSTILE_SITE_KEY']
    // - process?.env?.['NEXT_PUBLIC_TURNSTILE_SITE_KEY']
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)\s*(?:\.\s*|\?\.\s*)?(?:NEXT_PUBLIC_TURNSTILE_SITE_KEY|\[['"]NEXT_PUBLIC_TURNSTILE_SITE_KEY['"]\])\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'turnstile-secret-key',
    description:
      'Use getTurnstileEnvConfig() instead of process.env.TURNSTILE_SECRET.',
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)\s*(?:\.\s*|\?\.\s*)?(?:TURNSTILE_SECRET|\[['"]TURNSTILE_SECRET['"]\])\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
];
