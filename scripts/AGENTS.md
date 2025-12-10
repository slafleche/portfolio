# Agent Instructions for `scripts`

This directory contains project tooling and automation scripts.

## Responsibilities (`scripts-tooling`)

- Must: Keep scripts as the source of truth for generated artifacts (favicons,
  fonts, locales, lint rule checks, assets, etc.).
- Must: Prefer idempotent, repeatable scripts that can be safely re-run locally
  and in CI.

## Constraints (`scripts-tooling`)

- Must: When architecture or rules change (for example, updates to
  `rules.yaml`), update any dependent scripts here to match.
- Must: Avoid adding app-specific business logic to generic helper scripts; keep
  them focused on build, generation, and validation tasks.
- Must: Keep `package.json` scripts in sync with these tools; when adding or
  changing generation or linting behavior, update both the underlying script
  file and the corresponding `package.json` entry together.
