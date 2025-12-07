# Agent Instructions for `app/[LOCALE]/debug`

This directory contains debug sandboxes and inspection pages. Changes here
must not leak into production behaviour.

## Tokens and isolation

- Must: Keep debug pages self-contained; do not add or modify entries in
  `src/tokens` as part of work on files under `app/[LOCALE]/debug/`.
- Must: By default, do not import tokens (`@/tokens/...`) into debug pages.
- May: When a specific debug sandbox genuinely needs to inspect real token
  values (for example, to visualise favicon themes or form layouts), you may
  whitelist token imports for that page. Each whitelist is per-page and must
  be kept in sync between this file (for humans) and
  `scripts/lint/debugTokens.config.mjs` (for the lint guardrails).

