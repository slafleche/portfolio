// Runtime configuration lint helpers.
// These functions scan source content for direct env usage according to the
// rule sets in scripts/lint/*.mjs. They are intended for use in tests and in
// future lint hooks; this file does not perform any CLI wiring yet.

import path from 'node:path';
import {
  BREVO_ENV_USAGE_PATTERNS,
  RUNTIME_ENV_USAGE_PATTERNS,
  TURNSTILE_ENV_USAGE_PATTERNS,
} from './lint/runtimeConfigEnvUsagePatterns.mjs';
import {
  TESTS_RUNTIME_ENV_USAGE_PATTERNS,
} from './lint/runtimeEnvTestsRules.mjs';

/**
 * @typedef {import('./lint/runtimeEnvRules.mjs').RuntimeEnvUsagePattern} RuntimeEnvUsagePattern
 * @typedef {import('./lint/turnstileConfigRules.mjs').TurnstileEnvUsagePattern} TurnstileEnvUsagePattern
 * @typedef {import('./lint/brevoConfigRules.mjs').BrevoEnvUsagePattern} BrevoEnvUsagePattern
 */

/**
 * @typedef {Object} RuntimeConfigViolation
 * @property {'env' | 'turnstile' | 'brevo'} category
 * @property {string} filePath
 * @property {number} lineNumber
 * @property {RuntimeEnvUsagePattern | TurnstileEnvUsagePattern | BrevoEnvUsagePattern} rule
 * @property {string} message
 */

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function isIndexInsideStringLiteral(line, index) {
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;

  for (let position = 0; position < line.length; position += 1) {
    const char = line[position];
    const prev = position > 0 ? line[position - 1] : null;

    if (char === "'" && prev !== '\\' && !inDouble && !inBacktick) {
      inSingle = !inSingle;
    } else if (char === '"' && prev !== '\\' && !inSingle && !inBacktick) {
      inDouble = !inDouble;
    } else if (char === '`' && prev !== '\\') {
      inBacktick = !inBacktick;
    }

    if (position === index) {
      return inSingle || inDouble || inBacktick;
    }
  }

  return false;
}

function isPrivateLaunchKeyOnlyInStrings(line) {
  const envKeyRegex =
    /PRIVATE_LAUNCH_(?:USER|PASSWORD|ENABLED_STAGING|ENABLED_RELEASE)/g;
  let match;
  let sawMatch = false;

  while ((match = envKeyRegex.exec(line)) !== null) {
    sawMatch = true;
    const index = match.index;
    if (!isIndexInsideStringLiteral(line, index)) {
      return false;
    }
  }

  return sawMatch;
}

function shouldSkipMatch(category, line, pattern, context = {}) {
  // Console logging exceptions for private-launch env keys: allow them to be
  // mentioned in log messages while still treating other usages as violations.
  if (
    category === 'env' &&
    pattern.id === 'runtime-private-launch' &&
    context.inConsoleBlock
  ) {
    // If this line also performs a real env access, do not skip.
    if (line.includes('process.env')) {
      return false;
    }

    // Skip only when the private-launch keys appear inside string literals
    // (for example, log messages) within a console.* call.
    if (isPrivateLaunchKeyOnlyInStrings(line)) {
      return true;
    }
  }

  return false;
}

function scanWithPatterns(category, filePath, content, patterns) {
  /** @type {RuntimeConfigViolation[]} */
  const violations = [];
  const posix = normalizePath(filePath);
  const lines = content.split('\n');

  let inConsoleBlock = false;

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];

    const startsConsoleBlock =
      /\bconsole\.(?:log|error|warn|info)\s*\(/.test(line);
    if (startsConsoleBlock) {
      inConsoleBlock = true;
    }

    for (const pattern of patterns) {
      if (
        pattern.allowedPathSubstrings &&
        pattern.allowedPathSubstrings.some((marker) =>
          posix.includes(marker),
        )
      ) {
        continue;
      }

      if (pattern.regex.test(line)) {
        if (
          shouldSkipMatch(category, line, pattern, {
            inConsoleBlock,
          })
        ) {
          continue;
        }
        violations.push({
          category,
          filePath: posix,
          lineNumber,
          rule: pattern,
          message: pattern.description,
        });
      }
    }

    if (inConsoleBlock && /\)\s*;?\s*$/.test(line)) {
      inConsoleBlock = false;
    }
  }

  return violations;
}

/**
 * Scan a source file for direct env-tier usage (NODE_ENV, VERCEL_ENV, etc.).
 *
 * @param {string} filePath
 * @param {string} content
 * @returns {RuntimeConfigViolation[]}
 */
export function scanRuntimeEnvUsage(filePath, content) {
  return scanWithPatterns(
    'env',
    filePath,
    content,
    RUNTIME_ENV_USAGE_PATTERNS,
  );
}

/**
 * Scan a source file for direct Turnstile env usage.
 *
 * @param {string} filePath
 * @param {string} content
 * @returns {RuntimeConfigViolation[]}
 */
export function scanTurnstileEnvUsage(filePath, content) {
  return scanWithPatterns(
    'turnstile',
    filePath,
    content,
    TURNSTILE_ENV_USAGE_PATTERNS,
  );
}

/**
 * Scan a source file for direct Brevo env usage.
 *
 * @param {string} filePath
 * @param {string} content
 * @returns {RuntimeConfigViolation[]}
 */
export function scanBrevoEnvUsage(filePath, content) {
  return scanWithPatterns(
    'brevo',
    filePath,
    content,
    BREVO_ENV_USAGE_PATTERNS,
  );
}

/**
 * Convenience helper to run all runtime-config scans in one pass.
 *
 * @param {string} filePath
 * @param {string} content
 * @returns {RuntimeConfigViolation[]}
 */
export function scanAllRuntimeConfigUsage(filePath, content) {
  return [
    ...scanRuntimeEnvUsage(filePath, content),
    ...scanTurnstileEnvUsage(filePath, content),
    ...scanBrevoEnvUsage(filePath, content),
  ];
}

/**
 * Scan a test file for direct env-tier usage (NODE_ENV, VERCEL_ENV, Turnstile,
 * Brevo, etc.) that should go through the runtime env harness instead.
 *
 * This reuses the same regex patterns as application scans, but allows direct
 * env access inside the dedicated runtime env harness helper.
 *
 * @param {string} filePath
 * @param {string} content
 * @returns {RuntimeConfigViolation[]}
 */
export function scanRuntimeEnvUsageInTests(filePath, content) {
  const posix = normalizePath(filePath);

  if (!posix.includes('tests/')) {
    return [];
  }

  return scanWithPatterns(
    'env',
    filePath,
    content,
    TESTS_RUNTIME_ENV_USAGE_PATTERNS,
  );
}
