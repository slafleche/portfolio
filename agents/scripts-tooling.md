# Module: scripts-tooling

## Purpose

Keep project tooling and automation scripts as the single source of truth for generation and verification tasks.

## Key points

- Use scripts as the source of truth for generating artifacts (favicons, fonts, locales, lint rule checks, etc.) instead of manual edits.
- Prefer idempotent, repeatable scripts that can be safely re-run locally and in CI.
- When architecture or rules change (for example, updates to `rules.yaml`), update any dependent scripts under `scripts/` to match.
- Avoid adding app-specific business logic to generic helper scripts; keep them focused on build, generation, and validation tasks.

