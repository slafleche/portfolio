// Global lint-rule configuration and per-page exceptions.
// This file is the source of truth for:
// - Files that should be ignored entirely by lint guardrails.
// - Paths where raw CSS property rules are skipped (tokens, generated).
// - Literal reset values that are allowed even though they look like
//   "raw" CSS strings (e.g. border: 'none').
// - Per-page token import whitelists for debug sandboxes.

// Files to skip entirely (matched by substring in the relative path).
export const LINT_FILE_IGNORE_SUBSTRINGS = [
  '.bak.',
];

// Paths where raw CSS property checks (background/border/padding/margin/
// boxShadow/backdropFilter) are not applied because they are config or
// generated artefacts rather than style-layer sources.
export const STYLE_RULE_SKIP_PATHS = [
  'src/tokens/',
  'public/main.js',
  'src/components/debug/ProjectorPathDebug.tsx',
];

// Literal reset values that are allowed for specific inline style rules.
// Keys are rule ids from FORBIDDEN_PATTERNS in checkLintRules.mjs.
// Each entry is an array of predicates that return true when a line
// should be treated as an allowed reset for that rule.
export const STYLE_LITERAL_RESETS = {
  'background-inline': [
    // Allow plain background resets (`background: 'none'`) but not
    // backgroundColor, which must still use helpers.
    (line) =>
      /\bbackground\s*:\s*['"]none(?:\s*!important)?['"]/.test(
        line,
      ) && !/\bbackgroundColor\b/.test(line),
  ],
  'border-inline': [
    // Allow plain border resets (`border: 'none'`) but not side-specific
    // or radius shorthands, which must still use helpers.
    (line) =>
      /\bborder\s*:\s*['"]none(?:\s*!important)?['"]/.test(line) &&
      !/\bborder(?:Top|Right|Bottom|Left|Radius)\b/.test(line),
    // Allow inherit for radius, since it does not define a new shape.
    (line) =>
      /\bborderRadius\s*:\s*['"]inherit(?:\s*!important)?['"]/.test(
        line,
      ),
  ],
  'box-shadow-inline': [
    // Allow plain box-shadow resets (`boxShadow: 'none'`).
    (line) =>
      /\bboxShadow\s*:\s*['"]none(?:\s*!important)?['"]/.test(line),
  ],
};

// Per-page token import whitelists for debug sandboxes.
// Each entry documents a single debug page that is allowed to import
// specific token modules from "@/tokens/*", and why.
//
// By default, debug pages under app/[LOCALE]/debug/ must NOT import tokens.
// Only pages listed here are exempt, and only for the explicit modules
// listed in `allowedTokenImports`.

export const DEBUG_TOKEN_WHITELISTS = [
  {
    filePath: 'app/[LOCALE]/debug/favicons/page.tsx',
    purpose:
      'Favicon debug page: exercises favicon token set and asset plan.',
    allowedTokenImports: [
      '@/tokens/favicon.tokens',
    ],
  },
  {
    filePath:
      'app/[LOCALE]/debug/formelements/SubmissionTimelineSection.tsx',
    purpose:
      'Form elements debug page: exercises form tokens and glassy button tokens.',
    allowedTokenImports: [
      '@/tokens/forms.tokens',
      '@/tokens/glassy.tokens',
    ],
  },
  {
    filePath: 'app/[LOCALE]/debug/projectorPath/page.tsx',
    purpose:
      'Projector path debug page: uses the hero font family for canvas text.',
    allowedTokenImports: [
      '@/tokens/fontFamilies.tokens',
    ],
  },
];
