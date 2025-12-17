// Linting rules for runtime-related environment usage in tests.
// This file reuses the runtime/Turnstile/Brevo env usage patterns and
// applies them to tests, while allowing direct env access inside the
// dedicated runtime env harness.

import {
  BREVO_ENV_USAGE_PATTERNS,
  RUNTIME_ENV_USAGE_PATTERNS,
  TURNSTILE_ENV_USAGE_PATTERNS,
} from './runtimeConfigEnvUsagePatterns.mjs';

/**
 * @typedef {Object} TestsRuntimeEnvUsagePattern
 * @property {string} id - Stable identifier for this rule.
 * @property {string} description - Human-readable description for error messages.
 * @property {RegExp} regex - Line-level pattern that matches disallowed usage.
 * @property {string[]} [allowedPathSubstrings] - Relative path substrings where this
 *   usage is allowed (for example, the central runtimeEnv test harness).
 */

const TESTS_ALLOWED_PATH_SUBSTRINGS = [
  'tests/helpers/runtimeEnvHarness.ts',
];

/**
 * Tests-domain env usage patterns: reuse the same regexes as application
 * rules, but allow direct env usage within the runtime env harness.
 *
 * @type {TestsRuntimeEnvUsagePattern[]}
 */
export const TESTS_RUNTIME_ENV_USAGE_PATTERNS = [
  ...RUNTIME_ENV_USAGE_PATTERNS,
  ...TURNSTILE_ENV_USAGE_PATTERNS,
  ...BREVO_ENV_USAGE_PATTERNS,
].map((pattern) => ({
  ...pattern,
  allowedPathSubstrings: [
    ...(pattern.allowedPathSubstrings ?? []),
    ...TESTS_ALLOWED_PATH_SUBSTRINGS,
  ],
}));

