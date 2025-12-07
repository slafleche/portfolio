#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { findMeasurementAliasViolations } from './measurementAliasesCheck.mjs';

const ROOT = path.resolve(process.cwd());

/**
 * Shared rule definitions.
 * Each rule has:
 * - id: stable identifier
 * - groupTitle: heading for grouped human output
 * - solution: short hint on how to fix
 * - regex: line-level pattern to match
 * - pattern (optional): substring that must be present in the POSIX path
 */
const FORBIDDEN_PATTERNS = [
  {
    id: 'background-inline',
    groupTitle: 'No raw background properties in styles.',
    solution:
      'Use backgrounds(...) helper instead of raw background/backgroundColor values.',
    regex: /background(?:Color)?\s*:\s*['"]/,
  },
  {
    id: 'border-inline',
    groupTitle: 'No raw border properties in styles.',
    solution:
      'Use borders(...) helper instead of raw border/borderRadius or side-specific border values.',
    regex:
      /border(?:Radius|Top|Right|Bottom|Left)?\s*:\s*['"]/,
  },
  {
    id: 'padding-inline',
    groupTitle: 'No raw padding values in styles.',
    solution:
      'Use paddings(...) helper instead of raw padding values.',
    regex:
      /padding(?:Top|Right|Bottom|Left)?\s*:\s*['"]/,
  },
  {
    id: 'margin-inline',
    groupTitle: 'No raw margin values in styles.',
    solution:
      'Use margins(...) helper instead of raw margin values.',
    regex:
      /margin(?:Top|Right|Bottom|Left)?\s*:\s*['"]/,
  },
  {
    id: 'box-shadow-inline',
    groupTitle: 'No raw boxShadow values in styles.',
    solution:
      'Use boxShadow(...) helper or token-driven boxShadows instead of raw boxShadow strings.',
    regex: /boxShadow\s*:\s*['"`]/,
  },
  {
    id: 'backdrop-filter-inline',
    groupTitle: 'No raw backdrop-filter values in styles.',
    solution:
      'Use backdropFilters.style(...) helper instead of raw backdropFilter/WebkitBackdropFilter strings.',
    regex:
      /(backdropFilter|WebkitBackdropFilter)\s*:\s*['"`]/,
  },
];

const LAYER_IMPORT_BLOCKS = [
  {
    id: 'debug-pages-no-tokens',
    groupTitle: 'Debug pages must not import tokens.',
    solution:
      'Keep debug sandboxes self-contained; do not import tokens from "@/tokens/".',
    pattern: 'app/[LOCALE]/debug',
    regex: /from\s+['"]@\/tokens\//,
  },
  {
    id: 'helpers-import-components',
    groupTitle: 'Helpers must not import components.',
    solution:
      'Move shared logic to a lower layer or adjust imports so helpers only depend on tokens/helpers.',
    pattern: 'src/styles/helpers',
    regex: /from\s+['"]\.\.\/components\//,
  },
  {
    id: 'components-import-modules',
    groupTitle: 'Components should not import modules directly.',
    solution:
      'Route data/logic through appropriate boundaries instead of importing modules from component styles.',
    pattern: 'src/styles/components',
    regex: /from\s+['"]\.\.\/modules\//,
  },
  {
    id: 'modules-import-component-styles',
    groupTitle: 'Modules must not import component styles.',
    solution:
      'Move shared styles to helpers/tokens or invert the dependency so components own their styles.',
    pattern: 'src/modules',
    regex: /from\s+['"]\.\.\/styles\/components\//,
  },
];

const MEASUREMENT_RULES = [
  {
    id: 'measurement-m-css',
    groupTitle: 'Do not call m(...).css() in component styles.',
    solution:
      'Either hard-code the value or move the measurement into tokens/helpers; reserve m(...) for real reuse/math.',
    pattern: 'src/styles/components',
    // Match m(<number>[, 'unit']) .css(…) to catch trivial literal usage,
    // but allow m(variable, …).css() helpers like addDeg.
    regex: /m\(\s*\d+(?:\.\d+)?(?:\s*,\s*['"][^'"]+['"])?\s*\)\.css\(/,
  },
];

// Alias-based rule for measurement helpers; actual matches are produced by
// measurementAliasesCheck.mjs, but we keep a stub here so reporting stays
// grouped and ordered with other rules.
const MEASUREMENT_ALIAS_RULE = {
  id: 'measurement-helper-m-literal',
  groupTitle:
    'Do not wrap m(...) in a local just to feed style helpers.',
  solution:
    'Use tokens or measurement variables (or plain CSS strings where helpers are not required); do not create local m(...) wrappers whose only purpose is to feed paddings/margins/borders/backgrounds/boxShadow/backdropFilters.',
};

const ALL_RULES = [
  ...FORBIDDEN_PATTERNS,
  ...MEASUREMENT_RULES,
  ...LAYER_IMPORT_BLOCKS,
  MEASUREMENT_ALIAS_RULE,
];

function isPlainMode() {
  return process.argv.includes('--plain');
}

function isHumanMode() {
  return process.argv.includes('--human');
}

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only', {
    encoding: 'utf-8',
  });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function getAllTrackedFiles() {
  const output = execSync('git ls-files', {
    encoding: 'utf-8',
  });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function readFile(filePath) {
  if (!existsSync(filePath)) return '';
  return readFileSync(filePath, 'utf-8');
}

/**
 * @typedef {Object} Violation
 * @property {string} filePath
 * @property {number} lineNumber
 * @property {object} rule
 */

function scanPatterns(filePath, content) {
  const posix = filePath.split(path.sep).join('/');

  // Skip raw CSS property checks for token/config and built artifact files.
  // These are not style-layer sources and may legitimately use keys like
  // "background" or "border" in non-CSS contexts.
  if (
    posix.startsWith('src/tokens/') ||
    posix === 'public/main.js'
  ) {
    return [];
  }

  const violations = [];
  const lines = content.split('\n');
  for (const rule of FORBIDDEN_PATTERNS) {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!rule.regex.test(line)) continue;

      // Allow plain background resets (`background: 'none'` / "none") while
      // still flagging all other raw background usages.
      if (rule.id === 'background-inline') {
        const isPlainBackgroundNone =
          /\bbackground\s*:\s*['"]none['"]/.test(line) &&
          !/\bbackgroundColor\b/.test(line);
        if (isPlainBackgroundNone) continue;
      }

      // Allow plain border resets (`border: 'none'` / "none") while still
      // flagging all other raw border usages.
      if (rule.id === 'border-inline') {
        const isPlainBorderNone =
          /\bborder\s*:\s*['"]none['"]/.test(line) &&
          !/\bborder(?:Top|Right|Bottom|Left|Radius)\b/.test(line);
        if (isPlainBorderNone) continue;
      }

      const lineNumber = index + 1;
      violations.push({
        filePath,
        lineNumber,
        rule,
      });
    }
  }
  return violations;
}

function scanImports(filePath, content) {
  const violations = [];
  const posix = filePath.split(path.sep).join('/');
  for (const block of LAYER_IMPORT_BLOCKS) {
    if (!posix.includes(block.pattern)) continue;
    const lines = content.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (block.regex.test(line)) {
        const lineNumber = index + 1;
        violations.push({
          filePath,
          lineNumber,
          rule: block,
        });
      }
    }
  }
  return violations;
}

function scanMeasurementCss(filePath, content) {
  const violations = [];
  const posix = filePath.split(path.sep).join('/');
  for (const rule of MEASUREMENT_RULES) {
    if (!posix.includes(rule.pattern)) continue;
    const lines = content.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (rule.regex.test(line)) {
        const lineNumber = index + 1;
        violations.push({
          filePath,
          lineNumber,
          rule,
        });
      }
    }
  }

  // Measurement alias analysis (m(...) wrapped only to feed helpers).
  const aliasViolations = findMeasurementAliasViolations(
    filePath,
    content,
  );
  for (const aliasViolation of aliasViolations) {
    violations.push({
      filePath,
      lineNumber: aliasViolation.lineNumber,
      rule: {
        id: 'measurement-helper-m-literal',
        groupTitle:
          'Do not wrap m(...) in a local just to feed style helpers.',
        solution:
          'Use tokens or measurement variables (or plain CSS strings where helpers are not required); do not create local m(...) wrappers whose only purpose is to feed paddings/margins/borders/backgrounds/boxShadow/backdropFilters.',
      },
    });
  }

  return violations;
}

function formatPlain(violations) {
  console.error('\nLint guardrails failed:\n');
  for (const violation of violations) {
    const { filePath, lineNumber, rule } = violation;
    const message = rule.groupTitle || 'Rule violation';
    console.error(` - ${filePath}:${lineNumber}: ${message}`);
  }
  console.error('\nPlease fix the issues above before committing.');
}

function formatHuman(violations) {
  console.error('\nLint guardrails failed:\n');

  const byRule = new Map();
  for (const violation of violations) {
    const { rule, filePath, lineNumber } = violation;
    const ruleId = rule.id || rule.groupTitle;
    if (!byRule.has(ruleId)) {
      byRule.set(ruleId, {
        rule,
        files: new Map(),
      });
    }
    const group = byRule.get(ruleId);
    if (!group.files.has(filePath)) {
      group.files.set(filePath, new Set());
    }
    group.files.get(filePath).add(lineNumber);
  }

  for (const rule of ALL_RULES) {
    const ruleId = rule.id || rule.groupTitle;
    const group = byRule.get(ruleId);
    if (!group) continue;
    const { files } = group;

    console.error(`- ${rule.groupTitle}`);
    if (rule.solution) {
      console.error(`  - Solution: ${rule.solution}`);
    }
    console.error('  Problematic files:');

    const sortedFiles = Array.from(files.keys()).sort();
    for (const filePath of sortedFiles) {
      const lineNumbers = Array.from(files.get(filePath)).sort(
        (a, b) => a - b,
      );
      console.error(`  - ${filePath}`);
      for (const lineNumber of lineNumbers) {
        console.error(`    - L${lineNumber}`);
      }
    }

    console.error('');
  }

  // Summary with counts by file.
  const byFile = new Map();
  for (const { filePath } of violations) {
    byFile.set(filePath, (byFile.get(filePath) ?? 0) + 1);
  }

  const totalViolations = violations.length;
  const filesWithViolations = byFile.size;

  console.error('Summary:');
  console.error(`- Files with violations: ${filesWithViolations}`);
  console.error(`- Total violations: ${totalViolations}`);
  console.error('- Violations by file:');

  const sortedFiles = Array.from(byFile.keys()).sort();
  for (const filePath of sortedFiles) {
    const count = byFile.get(filePath) ?? 0;
    console.error(`  - ${filePath}: ${count}`);
  }

  console.error('\nPlease fix the issues above before committing.');
}

function main() {
  const useAll =
    process.env.LINT_RULES_ALL === '1' ||
    process.argv.includes('--all');

  const usePlain = isPlainMode() && !isHumanMode();

  const targetFiles = useAll ? getAllTrackedFiles() : getStagedFiles();
  if (!targetFiles.length) {
    return 0;
  }

  const violations = [];
  for (const relativePath of targetFiles) {
    if (relativePath.includes('.bak.')) continue;
    const ext = path.extname(relativePath).toLowerCase();
    if (!['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(ext)) continue;
    const fullPath = path.join(ROOT, relativePath);
    const content = readFile(fullPath);
    violations.push(...scanPatterns(relativePath, content));
    violations.push(...scanImports(relativePath, content));
    violations.push(...scanMeasurementCss(relativePath, content));
  }

  if (violations.length) {
    if (usePlain) {
      formatPlain(violations);
    } else {
      formatHuman(violations);
    }
    return 1;
  }

  return 0;
}

process.exitCode = main();
