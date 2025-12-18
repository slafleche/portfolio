// Patterns and whitelists for the secret lookout checks.
// This file is data-only: scripts/checkSecretLookout.mjs owns the logic.

/**
 * Relative-path substrings where secret scanning should be skipped entirely.
 * Use this for large generated trees or dependencies rather than app code.
 */
export const SECRET_LOOKOUT_IGNORE_PATH_SUBSTRINGS = [
  'node_modules/',
  '.git/',
  '.next/',
  '.yarn/',
  'dist/',
  'build/',
  'coverage/',
  // Env typing file is allowed to list canonical variable names.
  'types/env.d.ts',
];

/**
 * File extensions that are treated as text and scanned for secrets.
 * Extensions are matched case-insensitively.
 */
export const SECRET_LOOKOUT_SCAN_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.json',
  '.yml',
  '.yaml',
  '.md',
  '.mdx',
  '.txt',
];

/**
 * Path substrings that force a file to be scanned even if its extension is
 * not in SECRET_LOOKOUT_SCAN_EXTENSIONS. This is primarily for .env-style
 * files (e.g. ".env", ".env.local", ".env.production").
 */
export const SECRET_LOOKOUT_SCAN_PATH_SUBSTRINGS = [
  '.env',
];

/**
 * Base email pattern. This intentionally matches broadly; whitelists carve
 * out safe addresses and domains used in tests or examples.
 */
export const SECRET_EMAIL_PATTERN =
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

/**
 * Exact email addresses that are considered safe and should not block commits.
 * Add any test/demo addresses here (for example, from docs or fixtures).
 */
export const SECRET_EMAIL_WHITELIST_STRINGS = [
  'example@example.com',
];

/**
 * Regex-based whitelists for email addresses. Use this for whole domains
 * that are safe in tests, such as "@example.com".
 */
export const SECRET_EMAIL_WHITELIST_PATTERNS = [
  /@example\.com$/i,
  // Common image filename patterns like "hero@2x.jpg" or "icon@3x.png".
  /@(?:1x|2x|3x)\.(?:jpe?g|png|webp|avif|gif)$/i,
];

/**
 * @typedef {Object} SecretApiKeyPattern
 * @property {string} id - Stable identifier for this pattern.
 * @property {string} description - Human-readable label shown in errors.
 * @property {RegExp} regex - Line-level pattern that matches the secret value.
 * @property {string[]} [allowedValues] - Exact secret-looking values that
 *   are safe (for example, documented fake keys).
 * @property {string[]} [allowedPathSubstrings] - Relative path substrings
 *   where this pattern is allowed (for example, dedicated fixture files).
 */

/**
 * API key patterns for services used in this project.
 *
 * Start small and add more as needed. The goal is to catch accidental commits
 * of real keys without blocking safe test values. When introducing a new
 * provider, add its key shape here.
 *
 * @type {SecretApiKeyPattern[]}
 */
export const SECRET_API_KEY_PATTERNS = [
  {
    id: 'brevo-api-key',
    description: 'Brevo API key (xkeysib-…)',
    // Brevo API keys typically start with "xkeysib-" followed by multiple
    // hexadecimal segments. This pattern is intentionally broad.
    regex: /xkeysib-[0-9a-f-]{24,}/i,
    allowedValues: [],
    allowedPathSubstrings: [],
  },
  {
    id: 'turnstile-secret',
    description: 'Cloudflare Turnstile secret key (1x/2x/3x…)',
    // Turnstile sample secrets in the docs and tests use a leading digit
    // followed by "x" and a long alphanumeric tail (for example,
    // "1x0000000000000000000000000000000AA"). This pattern is intentionally
    // broad so real secrets are caught wherever they appear.
    regex: /[123]x[0-9a-z]{30,}/i,
    allowedValues: [
      '1x0000000000000000000000000000000AA',
      '2x0000000000000000000000000000000AA',
      '3x0000000000000000000000000000000AA',
    ],
    allowedPathSubstrings: [
      'tests/server/verifyTurnstileToken.test.ts',
    ],
  },
];
