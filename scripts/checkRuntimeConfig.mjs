// Runtime configuration lint helpers.
// These functions scan source content for direct env usage according to the
// rule sets in scripts/lint/*.mjs. They are intended for use in tests and in
// future lint hooks; this file does not perform any CLI wiring yet.

import path from 'node:path';
import {
  RUNTIME_ENV_USAGE_PATTERNS,
} from './lint/runtimeEnvRules.mjs';
import {
  TURNSTILE_ENV_USAGE_PATTERNS,
} from './lint/turnstileConfigRules.mjs';
import {
  BREVO_ENV_USAGE_PATTERNS,
} from './lint/brevoConfigRules.mjs';

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

function scanWithPatterns(category, filePath, content, patterns) {
  /** @type {RuntimeConfigViolation[]} */
  const violations = [];
  const posix = normalizePath(filePath);
  const lines = content.split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];

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
        violations.push({
          category,
          filePath: posix,
          lineNumber,
          rule: pattern,
          message: pattern.description,
        });
      }
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

