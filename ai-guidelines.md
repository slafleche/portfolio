# Project Guidelines

## Token → Helper → Module → Style Flow

- **Tokens (`/tokens`)**: Store pure data (measurements, colors, fonts) without
  `.css()` calls or imports from `styles/`.
- **Helpers (`/styles/helpers`)**: Share generic logic (measurement math,
  typography composition, spacing utilities). Helpers must not import component
  tokens.
- **Modules (`/modules`)**: Assemble tokens + helpers for a specific feature or
  component. Modules remain CSS-free; they simply prepare structured data.
- **Styles
  (`/styles/**/\*.css.ts`)**: Emit selectors via vanilla-extract. This is the only layer that imports palette vars or calls `.css()`.
  - vanilla-extract selectors must stay `&`-scoped. If you need to target
    siblings or children, add elements/classes in the markup or use
    `globalStyle` so style blocks never reference other class names directly.

## Workflow Expectations

- Work "wizard style": talk through the plan before coding, ask for missing
  context, wait for the “go” signal, then update the shared TODO checklist.
  Break larger efforts into smaller wizard steps.
- Maintain a `TODO.*.md` per large task: include a primer, mirror the wizard
  plan as a checklist, update continuously, delete once finished.
- When refactoring, keep each slice small (one file, or the pieces of a single
  split): finish import updates, confirm the result, and land the change before
  starting the next slice.
- Respect existing guardrails (no `.css()` in tokens, no styling logic in
  helpers/modules).
- Use shared utilities (`paddings`, `margins`, `borders`) instead of inlining
  equivalent CSS when possible.
- Tokens must never call `.css()`; measurements stay as `m(...)` objects so
  helpers can compose them.
- When defining spacing/border tokens, use plural keys (`paddings`, `margins`,
  `borders`) so they can be spread directly into the helpers without touching
  CSS.
- Keep `data-ui` contracts intact (`data-ui="heading"` for headings,
  `data-ui="link"` for reusable links).

## Communication

- Ask for confirmation before invasive changes or restructuring—and raise
  questions or blockers as soon as you see them.
- Capture decisions/strategy in README/TODO files to create a shared reference.
- Note any lint errors unrelated to the current change so they can be addressed
  later.

## Refactor Strategy

- Keep the existing path working while you build the replacement. Stand up the
  new code alongside the old, copy what you need, and evolve the copy in place.
- Map every consumer of the legacy code and migrate them in tiny, verified
  batches. After each batch, run the usual checks before touching the next
  group.
- Only remove the legacy version once every reference has been swapped over and
  validated. This prevents long-lived breakages and keeps the repo shippable
  throughout the refactor.
- If you plan to change a file name, better to do it first, commit and then do
  edits and both at the same time for better difs
