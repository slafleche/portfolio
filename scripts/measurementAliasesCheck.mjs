#!/usr/bin/env node
/**
 * Lightweight measurement alias analysis for linting:
 * - Detects const/let/var identifiers assigned to m(<number>[, 'unit'])
 * - Propagates aliases through simple reassignment (const b = a;)
 * - Flags cases where those "m-literal" identifiers are only used to feed
 *   style helpers (paddings, margins, borders, backgrounds, boxShadow,
 *   backdropFilters.style) instead of coming from tokens.
 *
 * This is intentionally text-based and conservative; it is not a full parser.
 */

/**
 * @typedef {Object} MeasurementAliasViolation
 * @property {string} filePath
 * @property {number} lineNumber
 * @property {string} message
 */

const DECLARATION_REGEX =
  /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*m\(\s*\d+(?:\.\d+)?(?:\s*,\s*['"][^'"]+['"])?\s*\)\s*;?/;

const ALIAS_REGEX =
  /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*;?/;

const HELPER_REGEX =
  /\b(paddings|margins|borders|backgrounds|boxShadow|backdropFilters(?:\.style)?)\b/;

/**
 * Find measurement alias violations in a single file.
 *
 * @param {string} filePath
 * @param {string} content
 * @returns {MeasurementAliasViolation[]}
 */
export function findMeasurementAliasViolations(filePath, content) {
  const lines = content.split('\n');

  /** @type {Map<string, number>} */
  const literalDecls = new Map();

  // First pass: collect direct m-literal declarations.
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = DECLARATION_REGEX.exec(line);
    if (match) {
      const name = match[1];
      if (!literalDecls.has(name)) {
        literalDecls.set(name, index + 1);
      }
    }
  }

  if (!literalDecls.size) return [];

  /** @type {Map<string, string>} */
  const aliasOf = new Map();

  // Second pass: collect simple aliases (const b = a;)
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = ALIAS_REGEX.exec(line);
    if (!match) continue;
    const aliasName = match[1];
    const sourceName = match[2];
    aliasOf.set(aliasName, sourceName);
  }

  // Build the full set of names that resolve back to an m-literal.
  /** @type {Set<string>} */
  const mLiteralNames = new Set(literalDecls.keys());

  let changed = true;
  while (changed) {
    changed = false;
    for (const [aliasName, sourceName] of aliasOf.entries()) {
      if (mLiteralNames.has(sourceName) && !mLiteralNames.has(aliasName)) {
        mLiteralNames.add(aliasName);
        changed = true;
      }
    }
  }

  // Track how each m-literal-like name is used.
  /** @type {Map<string, {helper: boolean; other: boolean}>} */
  const usage = new Map();
  for (const name of mLiteralNames) {
    usage.set(name, { helper: false, other: false });
  }

  const namePattern =
    mLiteralNames.size > 0
      ? new RegExp(
          `\\b(${Array.from(mLiteralNames).join('|')})\\b`,
          'g',
        )
      : null;

  if (namePattern) {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!namePattern.test(line)) continue;

      // Reset lastIndex for global regex
      namePattern.lastIndex = 0;

      const hasHelper = HELPER_REGEX.test(line);
      HELPER_REGEX.lastIndex = 0;

      let match;
      while ((match = namePattern.exec(line)) !== null) {
        const name = match[1];
        const info = usage.get(name);
        if (!info) continue;
        if (hasHelper) {
          info.helper = true;
        } else {
          info.other = true;
        }
      }
    }
  }

  /** @type {MeasurementAliasViolation[]} */
  const violations = [];

  for (const [name, declLine] of literalDecls.entries()) {
    const info = usage.get(name);
    if (!info) continue;
    // If this literal (or its aliases) are used in a helper call and *not*
    // used for anything else (math, .css(), etc.), then it's a fake token.
    if (info.helper && !info.other) {
      violations.push({
        filePath,
        lineNumber: declLine,
        message:
          'Do not wrap m(...) in a local just to feed style helpers. Use tokens or plain CSS strings instead.',
      });
    }
  }

  return violations;
}

