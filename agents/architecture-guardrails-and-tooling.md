# Module: architecture-guardrails-and-tooling

## Purpose

Align agents with the repo’s automated guardrails (ESLint, layering rules, scripts) instead of working against them.

## Key points

- Treat `rules.yaml` and root `AGENTS.md` as canonical for architecture and agent behavior.
- Do not weaken or bypass existing lint rules, layering constraints, or pre-commit checks unless the user explicitly requests it and understands the trade-offs.
- When rules change, keep `rules.yaml` and any related scripts under `scripts/` in sync.
- ESLint and lint-staged load `rules.yaml` via `eslint/rules.mjs` and `scripts/checkLintRules.mjs`; when editing the rules, bump the `updated` field in `rules.yaml` and run `yarn lint` to ensure the configs still load.

