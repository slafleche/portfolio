// Linting rules for Brevo-related environment usage.
// This file is data-only; scripts/checkRuntimeConfig.mjs owns the scanning logic.

/**
 * @typedef {Object} BrevoEnvUsagePattern
 * @property {string} id - Stable identifier for this rule.
 * @property {string} description - Human-readable description for error messages.
 * @property {RegExp} regex - Line-level pattern that matches disallowed usage.
 * @property {string[]} [allowedPathSubstrings] - Relative path substrings where this
 *   usage is allowed (for example, the central runtimeEnv helper).
 */

/**
 * Direct Brevo env usages that should be routed through getBrevoEnvConfig().
 *
 * This focuses on the four core Brevo-related keys currently present in .env files:
 * BREVO_API_KEY, MAIL_FROM, MAIL_TO, CONTACT_SUBJECT_PREFIX.
 *
 * @type {BrevoEnvUsagePattern[]}
 */
export const BREVO_ENV_USAGE_PATTERNS = [
  {
    id: 'brevo-api-key',
    description:
      'Use getBrevoEnvConfig() instead of process.env.BREVO_API_KEY.',
    // Match common direct usages of BREVO_API_KEY via process.env, including
    // optional chaining and bracket access.
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)\s*(?:\.\s*|\?\.\s*)?(?:BREVO_API_KEY|\[['"]BREVO_API_KEY['"]\])\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'brevo-mail-from',
    description:
      'Use getBrevoEnvConfig() instead of process.env.MAIL_FROM.',
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)\s*(?:\.\s*|\?\.\s*)?(?:MAIL_FROM|\[['"]MAIL_FROM['"]\])\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'brevo-mail-to',
    description:
      'Use getBrevoEnvConfig() instead of process.env.MAIL_TO.',
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)\s*(?:\.\s*|\?\.\s*)?(?:MAIL_TO|\[['"]MAIL_TO['"]\])\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'brevo-subject-prefix',
    description:
      'Use getBrevoEnvConfig() instead of process.env.CONTACT_SUBJECT_PREFIX.',
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)\s*(?:\.\s*|\?\.\s*)?(?:CONTACT_SUBJECT_PREFIX|\[['"]CONTACT_SUBJECT_PREFIX['"]\])\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
];
