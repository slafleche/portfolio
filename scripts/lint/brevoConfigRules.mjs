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
    // dot, optional chaining, and bracket access, all at the line level.
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)[^\n]*BREVO_API_KEY\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'brevo-mail-from',
    description:
      'Use getBrevoEnvConfig() instead of process.env.MAIL_FROM.',
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)[^\n]*MAIL_FROM\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'brevo-mail-to',
    description:
      'Use getBrevoEnvConfig() instead of process.env.MAIL_TO.',
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)[^\n]*MAIL_TO\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'brevo-subject-prefix',
    description:
      'Use getBrevoEnvConfig() instead of process.env.CONTACT_SUBJECT_PREFIX.',
    regex:
      /process\s*(?:\.\s*env|\?\.\s*env)[^\n]*CONTACT_SUBJECT_PREFIX\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'brevo-env-helper-usage',
    description:
      'Call getBrevoEnvConfig() only in server/runtime env helpers; pass Brevo config into consumers via props or parameters.',
    // Match usage of the Brevo env helper by name so imports or calls
    // outside approved server / runtimeEnv locations are treated as violations.
    regex: /\bgetBrevoEnvConfig\b/,
    allowedPathSubstrings: [
      'src/lib/runtimeEnv.ts',
      'src/server/contact/deliverContactMessage.ts',
      'app/api/contact/health/route.ts',
      // Meta/runtimeEnv tests and harnesses
      'tests/helpers/runtimeEnvHarness.ts',
      'tests/helpers/runtimeEnv.test.ts',
    ],
  },
];
