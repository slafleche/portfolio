# Project Guidelines

⚠️ **Whenever you load this file in a new chat, also load `rules.yaml`
(machine-readable rules). Those files contain the canonical constraints enforced
by tooling.** This doc only carries the narrative/context.

## Token → Helper → Module → Style (Narrative)

- Tokens: pure data, no `.css()`, stay in measurement space until the emitter
  layer.
- Helpers: math + shared styling logic; own gradients/shadows/spacing and only
  import tokens.
- Helper bundles: group related tokens (borders, filters, gradients, etc.) into
  semantic objects, but do **not** emit CSS properties from helpers. Pass the
  bundle through to the style layer and call the appropriate helper there
  (`borders(...)`, `backdropFilters.style(...)`, etc.) so CSS stays confined to
  the emitter layer.
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
- If a user message (non-code text) contains a `?`, reply using text-only responses—no code blocks or other non-text output.

## YAML Schema & Tooling Reference

- `rules.yaml` is the machine-readable source of truth.
- ESLint/ lint-staged load the YAML via `eslint/rules.mjs` and
  `scripts/checkLintRules.mjs`.
- Schema overview:
  - Each layer (`tokens`, `helpers`, etc.) declares `path`, optional
    `allowed_imports`, and `forbidden_imports`. ESLint uses those to guard
    imports automatically.
  - `workflow` defines the “talk → clarify → TODO → go” cadence and the
    pause-before-coding checklist.
- When editing rules: update `rules.yaml`, bump its `updated` date, then run
  `yarn lint` to ensure the generated configs still load.
