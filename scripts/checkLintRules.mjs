#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { findMeasurementAliasViolations } from './measurementAliasesCheck.mjs';
import {
  DEBUG_TOKEN_WHITELISTS,
  LINT_FILE_IGNORE_SUBSTRINGS,
  STYLE_RULE_SKIP_PATHS,
  STYLE_LITERAL_RESETS,
} from './lint/debugTokens.config.mjs';

const ROOT = path.resolve(process.cwd());

/**
 * Shared rule definitions. Each rule has:
 *
 * - Id: stable identifier
 * - GroupTitle: heading for grouped human output
 * - Solution: short hint on how to fix
 * - Regex: line-level pattern to match
 * - Pattern (optional): substring that must be present in the POSIX
 *   path
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
      /border(?:Radius|Top|Right|Bottom|Left)?\s*:\s*(?:['"]|important\()/,
  },
  {
    id: 'padding-inline',
    groupTitle: 'No raw padding values in styles.',
    solution:
      'Use paddings(...) helper instead of raw padding values.',
    regex:
      /padding(?:Top|Right|Bottom|Left)?\s*:\s*(?:['"]|important\()/,
  },
  {
    id: 'margin-inline',
    groupTitle: 'No raw margin values in styles.',
    solution: 'Use margins(...) helper instead of raw margin values.',
    regex:
      /margin(?:Top|Right|Bottom|Left)?\s*:\s*(?:['"]|important\()/,
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
    regex: /(backdropFilter|WebkitBackdropFilter)\s*:\s*['"`]/,
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
    regex:
      /m\(\s*\d+(?:\.\d+)?(?:\s*,\s*['"][^'"]+['"])?\s*\)\.css\(/,
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

const SPACING_SIMPLIFY_RULE = {
  id: 'spacing-helper-simplifiable-call',
  groupTitle:
    'Simplify paddings/margins helper inputs when they restate the same value multiple times.',
  solution:
    'Use axis shorthands or value shorthands (for example, paddings(m(16)), margins({ horizontal: x }), or vertical: x) instead of repeating the same spacing on multiple sides.',
};

const BORDERS_COMBINED_RULE = {
  id: 'borders-helper-combine-radius-and-edges',
  groupTitle:
    'Use a single borders(...) helper layer per style object.',
  solution:
    'Within a single style object, do not spread borders helpers more than once; combine radius, edges, and variants into a single borders(...) helper layer.',
};

const PADDINGS_SINGLE_LAYER_RULE = {
  id: 'paddings-helper-single-layer',
  groupTitle:
    'Use a single paddings(...) helper layer per style object.',
  solution:
    'Within a single style object, do not spread paddings(...) more than once; express the full padding intent in a single helper call.',
};

const MARGINS_SINGLE_LAYER_RULE = {
  id: 'margins-helper-single-layer',
  groupTitle:
    'Use a single margins(...) helper layer per style object.',
  solution:
    'Within a single style object, do not spread margins(...) more than once; express the full margin intent in a single helper call.',
};

const BACKGROUNDS_SINGLE_LAYER_RULE = {
  id: 'backgrounds-helper-single-layer',
  groupTitle:
    'Use a single backgrounds(...) helper layer per style object.',
  solution:
    'Within a single style object, do not spread backgrounds(...) more than once; express the full background intent in a single helper call.',
};

const BACKDROP_FILTERS_SINGLE_LAYER_RULE = {
  id: 'backdropFilters-helper-single-layer',
  groupTitle:
    'Use a single backdropFilters helper layer per style object.',
  solution:
    'Within a single style object, do not spread backdropFilters helpers (for example, backdropFilters.style(...)) more than once; express the full filter intent in a single helper call.',
};

const SINGLE_LAYER_HELPER_RULES = {
  borders: BORDERS_COMBINED_RULE,
  paddings: PADDINGS_SINGLE_LAYER_RULE,
  margins: MARGINS_SINGLE_LAYER_RULE,
  backgrounds: BACKGROUNDS_SINGLE_LAYER_RULE,
  backdropFilters: BACKDROP_FILTERS_SINGLE_LAYER_RULE,
};

const BORDERS_RADII_INTENT_RULE = {
  id: 'borders-radii-intent-redundant',
  groupTitle: 'Avoid redundant radius intent combinations.',
  solution:
    "In style-layer callers of borders(...)/borders.radii(...), do not use radius objects with an 'all' key or combine overlapping compass regions and corners; express the shape with the minimal radius intent set or scalar radius shorthand.",
};

const BORDERS_RADII_SHORTHAND_RULE = {
  id: 'borders-radii-shorthand',
  groupTitle: 'Prefer shorthand radii helpers.',
  solution:
    'Use borders.radii(<measurement>) for uniform radius and avoid radius wrapper objects; for shared tokens, call borders.radii(borderVars) instead of { radius: ... }.',
};

const ALL_RULES = [
  ...FORBIDDEN_PATTERNS,
  ...MEASUREMENT_RULES,
  ...LAYER_IMPORT_BLOCKS,
  MEASUREMENT_ALIAS_RULE,
  SPACING_SIMPLIFY_RULE,
  BORDERS_COMBINED_RULE,
  PADDINGS_SINGLE_LAYER_RULE,
  MARGINS_SINGLE_LAYER_RULE,
  BACKGROUNDS_SINGLE_LAYER_RULE,
  BACKDROP_FILTERS_SINGLE_LAYER_RULE,
  BORDERS_RADII_INTENT_RULE,
  BORDERS_RADII_SHORTHAND_RULE,
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

  // Skip raw CSS property checks for token/config and built artefact files.
  // These are not style-layer sources and may legitimately use keys like
  // "background" or "border" in non-CSS contexts.
  if (
    STYLE_RULE_SKIP_PATHS.some((prefix) => posix.startsWith(prefix))
  ) {
    return [];
  }

  const violations = [];
  const lines = content.split('\n');
  for (const rule of FORBIDDEN_PATTERNS) {
    const literalResets = STYLE_LITERAL_RESETS[rule.id] ?? [];
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const trimmed = line.trim();
      if (trimmed.startsWith('//')) continue;
      if (!rule.regex.test(line)) continue;
      if (literalResets.some((predicate) => predicate(line)))
        continue;

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
  const debugTokenConfig = DEBUG_TOKEN_WHITELISTS.find(
    (entry) => entry.filePath === posix,
  );
  for (const block of LAYER_IMPORT_BLOCKS) {
    if (!posix.includes(block.pattern)) continue;
    const lines = content.split('\n');
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!block.regex.test(line)) continue;

      // Per-page token import whitelists for debug sandboxes.
      if (block.id === 'debug-pages-no-tokens' && debugTokenConfig) {
        const isAllowed = debugTokenConfig.allowedTokenImports.some(
          (specifier) =>
            new RegExp(
              String.raw`from\s+['"]${specifier.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&',
              )}['"]`,
            ).test(line),
        );
        if (isAllowed) continue;
      }

      const lineNumber = index + 1;
      violations.push({
        filePath,
        lineNumber,
        rule: block,
      });
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

function scanSpacingSimplifications(filePath, content) {
  const posix = filePath.split(path.sep).join('/');

  // Skip token/config and built artefact files; spacing simplifications are
  // only enforced in style-layer sources.
  if (
    STYLE_RULE_SKIP_PATHS.some((prefix) => posix.startsWith(prefix))
  ) {
    return [];
  }

  const violations = [];

  // Look for paddings({...}) / margins({...}) calls with an inline object.
  const callPattern = /\b(paddings|margins)\(\s*\{([\s\S]*?)\}\s*\)/g;

  let match;
  while ((match = callPattern.exec(content)) !== null) {
    const objectBody = match[2];
    const props = {};

    const lines = objectBody.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//')) continue;

      const propMatch = /^([a-zA-Z]+)\s*:\s*([^,}]+)\s*[,}]?/.exec(
        line,
      );
      if (!propMatch) continue;

      const key = propMatch[1];
      let value = propMatch[2].trim();
      // Strip trailing inline comments from the value.
      value = value.replace(/\/\/.*$/, '').trim();

      props[key] = value;
    }

    const v = props.vertical;
    const h = props.horizontal;
    const t = props.top;
    const r = props.right;
    const b = props.bottom;
    const l = props.left;

    let simplifiable = false;

    // 1) left/right pair with same value, no horizontal axis.
    if (
      l !== undefined &&
      r !== undefined &&
      l === r &&
      h === undefined
    ) {
      simplifiable = true;
    }

    // 2) top/bottom pair with same value, no vertical axis.
    if (
      t !== undefined &&
      b !== undefined &&
      t === b &&
      v === undefined
    ) {
      simplifiable = true;
    }

    // 3) vertical/horizontal both present with same value and no side overrides.
    const hasAnySide =
      t !== undefined ||
      r !== undefined ||
      b !== undefined ||
      l !== undefined;
    if (
      v !== undefined &&
      h !== undefined &&
      v === h &&
      !hasAnySide
    ) {
      simplifiable = true;
    }

    // 4) Axis plus redundant side(s) that restate the same value.
    if (
      v !== undefined &&
      ((t !== undefined && t === v) || (b !== undefined && b === v))
    ) {
      simplifiable = true;
    }
    if (
      h !== undefined &&
      ((l !== undefined && l === h) || (r !== undefined && r === h))
    ) {
      simplifiable = true;
    }

    // 5) All four sides present with the same value and no axes.
    if (
      t !== undefined &&
      r !== undefined &&
      b !== undefined &&
      l !== undefined &&
      v === undefined &&
      h === undefined &&
      t === r &&
      r === b &&
      b === l
    ) {
      simplifiable = true;
    }

    if (!simplifiable) continue;

    const lineNumber = content
      .slice(0, match.index)
      .split('\n').length;
    violations.push({
      filePath,
      lineNumber,
      rule: SPACING_SIMPLIFY_RULE,
    });
  }

  return violations;
}


export function scanBordersRadiiIntent(filePath, content) {
  const posix = filePath.split(path.sep).join('/');

  // Skip token/config and built artefact files; radius intent simplifications
  // are only enforced in style-layer sources.
  if (STYLE_RULE_SKIP_PATHS.some((prefix) => posix.startsWith(prefix))) {
    return [];
  }

  if (
    !posix.startsWith('src/styles/') &&
    !posix.startsWith('app/[LOCALE]/debug/')
  ) {
    return [];
  }

  const violations = [];
  const callPattern =
    /\bborders(?:\.radii)?\(\s*\{([\s\S]*?)\}\s*\)/g;

  let match;
  while ((match = callPattern.exec(content)) !== null) {
    const callBody = match[1];
    const isRadiiCall = /borders\.radii/.test(match[0]);

    // Optional radius object: radius: { ... }
    const radiusMatch = /radius\s*:\s*{([\s\S]*?)}/.exec(callBody);
    const radiusKeys = new Set();

    const collectRadiusKeys = (radiusBody) => {
      const lines = radiusBody.split('\n');
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('//')) continue;
        const propMatch = /^([a-zA-Z]+)\s*:\s*/.exec(line);
        if (!propMatch) continue;
        const key = propMatch[1];
        // Only care about compass / shorthand keys.
        if (
          key === 'all' ||
          key === 'north' ||
          key === 'south' ||
          key === 'east' ||
          key === 'west' ||
          key === 'nw' ||
          key === 'ne' ||
          key === 'se' ||
          key === 'sw'
        ) {
          radiusKeys.add(key);
        }
      }
    };

    if (isRadiiCall) {
      collectRadiusKeys(callBody);
    } else if (radiusMatch) {
      collectRadiusKeys(radiusMatch[1]);
    }

    const hasRadiusKeys = radiusKeys.size > 0;
    const hasRadiusAll = radiusKeys.has('all');
    const hasNorth = radiusKeys.has('north');
    const hasSouth = radiusKeys.has('south');
    const hasEast = radiusKeys.has('east');
    const hasWest = radiusKeys.has('west');
    const hasNw = radiusKeys.has('nw');
    const hasNe = radiusKeys.has('ne');
    const hasSe = radiusKeys.has('se');
    const hasSw = radiusKeys.has('sw');

    // Detect use of edge-level `all` intent and overlapping axis/side
    // combinations in the borders(...) call by looking outside of the
    // radius block (if present).
    let edgeBody = callBody;
    if (radiusMatch) {
      const start = radiusMatch.index;
      const length = radiusMatch[0].length;
      edgeBody =
        callBody.slice(0, start) +
        ' '.repeat(length) +
        callBody.slice(start + length);
    }
    const hasEdgeAllIntent = /\ball\s*:\s*{/.test(edgeBody);
    const extractObjectBody = (body, key) => {
      const re = new RegExp(
        `${key}\\s*:\\s*\\{([\\s\\S]*?)\\}`,
        'm',
      );
      const matchObj = re.exec(body);
      return matchObj ? matchObj[1] : undefined;
    };
    const normalizeBlock = (src) =>
      src
        .replace(/\/\/.*$/gm, '')
        .replace(/\s+/g, ' ')
        .trim();

    const verticalBody = extractObjectBody(edgeBody, 'vertical');
    const horizontalBody = extractObjectBody(edgeBody, 'horizontal');
    const leftBody = extractObjectBody(edgeBody, 'left');
    const rightBody = extractObjectBody(edgeBody, 'right');
    const topBody = extractObjectBody(edgeBody, 'top');
    const bottomBody = extractObjectBody(edgeBody, 'bottom');

    const hasAxisRedundancy =
      verticalBody &&
      horizontalBody &&
      normalizeBlock(verticalBody) &&
      normalizeBlock(verticalBody) === normalizeBlock(horizontalBody);

    const hasSidePairRedundancy =
      ((leftBody &&
        rightBody &&
        normalizeBlock(leftBody) &&
        normalizeBlock(leftBody) === normalizeBlock(rightBody)) ||
        (topBody &&
          bottomBody &&
          normalizeBlock(topBody) &&
          normalizeBlock(topBody) === normalizeBlock(bottomBody)));

    // If there is neither radius intent, nor edge `all`, nor overlapping
    // axis/side combinations, nothing to do.
    if (
      !hasRadiusKeys &&
      !hasEdgeAllIntent &&
      !hasAxisRedundancy &&
      !hasSidePairRedundancy
    )
      continue;

    let redundant = false;

    // 1) Any use of radius `all` at the call site is considered redundant;
    // prefer scalar radius shorthand instead.
    if (hasRadiusAll) {
      redundant = true;
    }

    // 2) Region + overlapping corner combinations.
    if (
      (hasNorth && (hasNw || hasNe)) ||
      (hasSouth && (hasSw || hasSe)) ||
      (hasEast && (hasNe || hasSe)) ||
      (hasWest && (hasNw || hasSw))
    ) {
      redundant = true;
    }

    // 3) Opposite corner pairs (e.g., nw + se, ne + sw) are treated as
    // overly-specific and should be modeled with a simpler intent.
    if ((hasNw && hasSe) || (hasNe && hasSw)) {
      redundant = true;
    }

    // 4) Edge-level all intent (`all: { ... }`) is reserved for internal
    // helpers; callers in style-layer sources should not use it.
    if (hasEdgeAllIntent) {
      redundant = true;
    }

    // 5) Axis and side overlaps (for example, vertical + horizontal, or
    // left + right) that restate the same border intent are treated as
    // redundant; prefer a single shorthand (width/color/style or an
    // appropriate axis helper) instead of repeating the same spec.
    if (hasAxisRedundancy || hasSidePairRedundancy) {
      redundant = true;
    }

    if (!redundant) continue;

    const lineNumber = content
      .slice(0, match.index)
      .split('\n').length;
    violations.push({
      filePath,
      lineNumber,
      rule: BORDERS_RADII_INTENT_RULE,
    });
  }

  return violations;
}

export function scanBordersRadiiShorthand(filePath, content) {
  const posix = filePath.split(path.sep).join('/');

  // Only enforce in style-layer component files.
  if (!posix.startsWith('src/styles/components')) {
    return [];
  }

  const violations = [];
  const pattern = /borders\.radii\(\s*\{/g;

  let match;
  while ((match = pattern.exec(content)) !== null) {
    const startIndex = match.index;
    const snippet = content.slice(startIndex, startIndex + 200);

    const usesBorderVarsRadius =
      /all\s*:\s*borderVars\.radius/.test(snippet) ||
      /radius\s*:\s*borderVars\.radius/.test(snippet);
    const usesRadiusWrapper = /radius\s*:/.test(snippet);

    if (!usesBorderVarsRadius && !usesRadiusWrapper) continue;

    const lineNumber = content
      .slice(0, startIndex)
      .split('\n').length;

    violations.push({
      filePath,
      lineNumber,
      rule: BORDERS_RADII_SHORTHAND_RULE,
    });
  }

  return violations;
}

function scanSingleLayerHelpers(filePath, content) {
  const posix = filePath.split(path.sep).join('/');

  // Skip token/config, built artefact, and test files; single-layer helper
  // enforcement applies only to style-layer sources.
  if (
    STYLE_RULE_SKIP_PATHS.some((prefix) =>
      posix.startsWith(prefix),
    ) ||
    posix.startsWith('tests/') ||
    /\.test\.[jt]sx?$/.test(posix)
  ) {
    return [];
  }

  const violations = [];
  const lines = content.split('\n');
  const helperNames = Object.keys(SINGLE_LAYER_HELPER_RULES);

  const makeCounter = () =>
    helperNames.reduce((acc, name) => {
      acc[name] = 0;
      return acc;
    }, {});

  // Vanilla-extract style({ ... }) blocks.
  let inVeStyle = false;
  let veStartLine = 0;
  let veHelperCounts = makeCounter();
  let veSkipDepth = 0;

  // JSX inline style={{ ... }} blocks.
  let inJsxStyle = false;
  let jsxStartLine = 0;
  let jsxHelperCounts = makeCounter();

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];

    // Track vanilla-extract style({ ... }).
    if (line.includes('style({')) {
      inVeStyle = true;
      veStartLine = lineNumber;
      veHelperCounts = makeCounter();
      veSkipDepth = 0;
    }

    if (inVeStyle) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('//')) {
        const opens = (line.match(/{/g) || []).length;
        const closes = (line.match(/}/g) || []).length;

        if (veSkipDepth > 0) {
          veSkipDepth += opens - closes;
        } else if (
          line.includes('selectors:') ||
          line.includes('@media')
        ) {
          veSkipDepth += opens - closes;
        }

        if (veSkipDepth === 0) {
          for (const name of helperNames) {
            if (line.includes(`...${name}`)) {
              const matches = line.match(
                new RegExp(String.raw`\.\.\.${name}\b`, 'g'),
              );
              if (matches) veHelperCounts[name] += matches.length;
            }
          }
        }
      }

      if (line.includes('});')) {
        for (const name of helperNames) {
          if (veHelperCounts[name] > 1) {
            violations.push({
              filePath,
              lineNumber: veStartLine,
              rule: SINGLE_LAYER_HELPER_RULES[name],
            });
          }
        }
        inVeStyle = false;
        veSkipDepth = 0;
      }
    }

    // Track JSX style={{ ... }}.
    if (line.includes('style={{')) {
      inJsxStyle = true;
      jsxStartLine = lineNumber;
      jsxHelperCounts = makeCounter();
    }

    if (inJsxStyle) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('//')) {
        for (const name of helperNames) {
          if (line.includes(`...${name}`)) {
            const matches = line.match(
              new RegExp(String.raw`\.\.\.${name}\b`, 'g'),
            );
            if (matches) jsxHelperCounts[name] += matches.length;
          }
        }
      }

      if (line.includes('}}')) {
        for (const name of helperNames) {
          if (jsxHelperCounts[name] > 1) {
            violations.push({
              filePath,
              lineNumber: jsxStartLine,
              rule: SINGLE_LAYER_HELPER_RULES[name],
            });
          }
        }
        inJsxStyle = false;
      }
    }
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

  const targetFiles = useAll
    ? getAllTrackedFiles()
    : getStagedFiles();
  if (!targetFiles.length) {
    return 0;
  }

  const violations = [];
  for (const relativePath of targetFiles) {
    if (
      LINT_FILE_IGNORE_SUBSTRINGS.some((marker) =>
        relativePath.includes(marker),
      )
    )
      continue;
    if (relativePath.startsWith('tests/')) continue;
    const ext = path.extname(relativePath).toLowerCase();
    if (
      ![
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.mjs',
      ].includes(ext)
    )
      continue;
    const fullPath = path.join(ROOT, relativePath);
    const content = readFile(fullPath);
    violations.push(...scanPatterns(relativePath, content));
    violations.push(...scanImports(relativePath, content));
    violations.push(...scanMeasurementCss(relativePath, content));
    violations.push(
      ...scanSpacingSimplifications(relativePath, content),
    );
    violations.push(...scanSingleLayerHelpers(relativePath, content));
    violations.push(
      ...scanBordersRadiiIntent(relativePath, content),
    );
    violations.push(
      ...scanBordersRadiiShorthand(relativePath, content),
    );
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
