// Linting rules for runtime environment usage (NODE_ENV, VERCEL_ENV, branch).
// This file is data-only; scripts/checkRuntimeConfig.mjs owns the scanning logic.

/**
 * @typedef {Object} RuntimeEnvUsagePattern
 * @property {string} id - Stable identifier for this rule.
 * @property {string} description - Human-readable description for error messages.
 * @property {RegExp} regex - Line-level pattern that matches disallowed usage.
 * @property {string[]} [allowedPathSubstrings] - Relative path substrings where this
 *   usage is allowed (for example, the central runtimeEnv helper).
 */

/**
 * Direct env-tier usages that should be routed through src/lib/runtimeEnv instead.
 *
 * The goal is that application code (components, modules, scripts) no longer reads
 * env-tier variables directly and instead calls helpers such as isHostedEnv and
 * the other runtimeEnv helpers.
 *
 * @type {RuntimeEnvUsagePattern[]}
 */
export const RUNTIME_ENV_USAGE_PATTERNS = [
  {
    id: 'runtime-node-env',
    description:
      'Use runtimeEnv helpers instead of process.env.NODE_ENV.',
    // Match common direct usages of NODE_ENV via process.env, including:
    // - process.env.NODE_ENV
    // - process?.env.NODE_ENV
    // - process.env?.NODE_ENV
    // - process?.env?.NODE_ENV
    // - process.env['NODE_ENV']
    // - process?.env?.['NODE_ENV']
    //
    // This deliberately does not try to follow aliases (for example,
    // const env = process.env; env.NODE_ENV) and focuses on the obvious
    // direct access patterns.
    // Match any occurrence of NODE_ENV in code; the scanner is responsible
    // for scoping this to code files and allowed paths.
    regex: /\bNODE_ENV\b/,
    allowedPathSubstrings: [
      'src/lib/runtimeEnv.ts',
      'envPrimitives.mts',
    ],
  },
  {
    id: 'runtime-vercel-env',
    description:
      'Use runtimeEnv helpers instead of process.env.VERCEL_ENV.',
    // Match any occurrence of VERCEL_ENV in code.
    regex: /\bVERCEL_ENV\b/,
    allowedPathSubstrings: [
      'src/lib/runtimeEnv.ts',
      'envPrimitives.mts',
    ],
  },
  {
    id: 'runtime-vercel-branch',
    description:
      'Use runtimeEnv helpers instead of reading Vercel git branch or repo env vars directly.',
    // For branch-related env vars, treat any occurrence of the bare env
    // var name in code as a match, regardless of whether it is accessed
    // via process.env or in some other way. The caller is expected to
    // scope this to non-doc code.
    regex:
      /\b(?:VERCEL_GIT_COMMIT_REF|VERCEL_GIT_BRANCH|BRANCH|VERCEL_GIT_REPO_SLUG)\b/,
    allowedPathSubstrings: [
      'src/lib/runtimeEnv.ts',
      'envPrimitives.mts',
    ],
  },
  {
    id: 'runtime-vercel-flag',
    description:
      'Use envPrimitives/runtimeEnv helpers instead of process.env.VERCEL.',
    // Match any occurrence of the VERCEL flag in code.
    regex: /\bVERCEL\b/,
    allowedPathSubstrings: [
      'src/lib/runtimeEnv.ts',
      'envPrimitives.mts',
    ],
  },
  {
    id: 'runtime-private-launch',
    description:
      'Route private-launch env usage through dedicated helpers instead of reading the env vars directly.',
    // Match any occurrence of the private-launch env keys (user/password and
    // per-env flags). The scanner uses path allowlists to exempt canonical
    // helpers / harnesses.
    regex:
      /\b(?:PRIVATE_LAUNCH_(?:USER|PASSWORD)|PRIVATE_(?:STAGING|RELEASE|LOCAL))\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
  {
    id: 'runtime-indexing-env',
    description:
      'Route ALLOW_INDEXING env usage through dedicated helpers instead of reading the env var directly.',
    // Match any occurrence of the indexing env key by name; the scanner uses
    // path allowlists to exempt the central runtimeEnv helper.
    regex: /\bALLOW_INDEXING\b/,
    allowedPathSubstrings: ['src/lib/runtimeEnv.ts'],
  },
];
