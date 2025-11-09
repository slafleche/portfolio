# Project Guidelines

⚠️ **Whenever you load this file in a new chat, also load `ai.yaml`
(machine-readable rules) and, if you need extra detail, `docs/ai-rules.md`.
Those files contain the canonical constraints enforced by tooling.** This doc
only carries the narrative/context.

## Token → Helper → Module → Style (Narrative)

- Tokens: pure data, no `.css()`, stay in measurement space until the emitter
  layer.
- Helpers: math + shared styling logic; own gradients/shadows/spacing and only
  import tokens.
- Modules: glue tokens + helpers, stay CSS-free.
- Styles: vanilla-extract selectors only, import helpers/tokens via the
  sanctioned layers.

## Workflow

1. Talk → clarify → TODO → go.
2. TODO files: Primer first, then checklist, then `### Step N — title` sections
   once the list is complete.
3. Pause-before-coding checklist: consume tokens directly, use helpers, no
   re-aliasing.

## Communication

- Confirm invasive changes.
- Capture decisions in README/TODO files.
- Surface unrelated lint errors so we can plan follow-ups.

## YAML Schema & Tooling Reference

- `ai.yaml` is the machine-readable source of truth.
- ESLint/ lint-staged load the YAML via `eslint/rules.mjs` and
  `scripts/checkLintRules.mjs`.
- Schema overview:
  - Each layer (`tokens`, `helpers`, etc.) declares `path`, optional
    `allowed_imports`, and `forbidden_imports`. ESLint uses those to guard
    imports automatically.
  - `workflow` defines the “talk → clarify → TODO → go” cadence and the
    pause-before-coding checklist.
- When editing rules: update `ai.yaml`, bump its `updated` date, then run
  `yarn lint` to ensure the generated configs still load.
