# Project Guidelines

For hard enforcement rules (layering, helper usage, TODO structure), see `ai.yaml`. This doc keeps the narrative/context so humans know why the rules exist.

## Token → Helper → Module → Style (Narrative)

- Tokens: pure data, no `.css()`, stay in measurement space until the emitter layer.
- Helpers: math + shared styling logic; own gradients/shadows/spacing and only import tokens.
- Modules: glue tokens + helpers, stay CSS-free.
- Styles: vanilla-extract selectors only, import helpers/tokens via the sanctioned layers.

## Workflow

1. Talk → clarify → TODO → go.
2. TODO files: Primer first, then checklist, then `### Step N — title` sections once the list is complete.
3. Pause-before-coding checklist: consume tokens directly, use helpers, no re-aliasing.

## Communication

- Confirm invasive changes.
- Capture decisions in README/TODO files.
- Surface unrelated lint errors so we can plan follow-ups.

## Refactors

Keep replacements side-by-side until proven, migrate in small verified batches, then delete legacy paths.
