# AI Rule Config (ai.yaml)

`ai.yaml` is the source of truth for hard project rules. Tooling (ESLint, lint-staged) reads this file to generate guardrails automatically.

## Schema Overview

```yaml
version: 1           # increment when structure changes
updated: 'YYYY-MM-DD' # keep in sync with edits
reference: ai.md     # narrative doc that explains the why

layers:
  tokens:
    path: 'src/tokens'
    allowed_imports: []
    rules:
      no_css_alias: true
      measurement_math_only: true
  helpers:
    path: 'src/styles/helpers'
    allowed_imports:
      - '../**/tokens/**'
    rules:
      required_helpers:
        - paddings
        - margins
        - borders
        - backgrounds
        - boxShadow
      forbidden_properties:
        - padding
        - margin
        - border
        - borderRadius
        - background
        - backgroundColor
  ...

workflow:
  talk_clarify_todo_go: true
  structured_todos:
    primer_required: true
    steps_required: true
  pause_before_coding_checklist:
    - tokens_consumed_directly
    - helpers_in_use
    - no_realiasing
```

### Updating Rules

1. Edit `ai.yaml`.
2. If the schema changes, bump `version` and note the change date.
3. Run `yarn lint` to confirm ESLint loads the new rules (it regenerates overrides via `eslint/rules.mjs`).
4. If you add new hard rules, reflect them in `ai.md`’s narrative section so humans know why they exist.

### Tooling

- **ESLint** imports `eslint/rules.mjs`, which parses `ai.yaml` and generates layer-specific `no-restricted-imports` overrides.
- **lint-staged** runs `scripts/checkLintRules.mjs`, mirroring the forbidden property/import patterns for staged files.

Keep `ai.yaml` authoritative—edit it first, then regenerate or adjust tooling as needed.
