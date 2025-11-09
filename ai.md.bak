# Project Guidelines

## Token → Helper → Module → Style Flow

- **Tokens (`/tokens`)**: Store pure data (measurements, colors, fonts) without
  `.css()` calls or imports from `styles/`.
  > ⚠ Token quick rules: use raw `m(...)`/`color(...)`, no `.css()` in tokens, and group values under helper-ready keys (`paddings`, `borders`, `fonts`).
  > ⚠ Keep tokens structured: export the typed object only. Consumers should destructure locally (or use helpers) instead of exporting individual measurements.
  > ⚠ Name collections for helpers explicitly: prefer plural keys like `paddings`, `margins`, `borders`. Avoid singular `padding`/`margin`/`border` so it’s obvious the object feeds the helpers.
  > ⚠ When consuming tokens, use the object path (`menuVars.hover.shadow`) directly; only introduce locals when you are applying a real transformation. “Just renaming” creates noise and is treated as an anti-pattern.
  > ⚠ Pluralized layout objects (`paddings`, `margins`, `borders`, `outlines`, etc.) must be passed straight into their helper—styles should not explode them into manual `border*`/`padding*`/`outline*` props. Shadow specs follow the same rule: keep the object under a plural key (e.g., `shadow.boxShadows`) and feed it directly to `boxShadow(...)`. Same idea for gradients: tokens should expose gradient packs and styles call the existing gradient helpers (no raw gradient strings).
  > ⚠ When defining these objects, don’t mix raw CSS strings/numbers with MeasurementKit instances inside the same object—stay in measurement space until the helper emits CSS so we don’t end up with invalid combinations.
  > ⚠ Keep measurement math in measurement space. Combine tokens with helpers (e.g., `menuVars.height.add(...)`). **Do not coerce to a primitive inside tokens or helpers.** Perform numeric coercion **only at an adapter/emission boundary** using the **sanctioned MK coercion method** (per the current MK API). Never access internal fields directly; no implicit string coercion.


- **Helpers (`/styles/helpers`)**: Share generic logic (measurement math,
  typography composition, spacing utilities). Helpers must not import component
  tokens.
  > ⚠ Gradients live behind helpers (see `styles/helpers/cardGradient.helper` etc.); don’t hand-write gradient strings in tokens or styles when a helper exists.
- **Modules (`/modules`)**: Assemble tokens + helpers for a specific feature or
  component. Modules remain CSS-free; they simply prepare structured data.
- **Styles
  (`/styles/**/\*.css.ts`)**: Emit selectors via vanilla-extract. This is the only layer that imports palette vars or calls `.css()`.
  - vanilla-extract selectors must stay `&`-scoped. If you need to target
    siblings or children, add elements/classes in the markup or use
    `globalStyle` so style blocks never reference other class names directly.

## Workflow Expectations (cheat sheet)

- **Always**: follow the “talk → clarify → TODO → go” cadence. Discuss context first, ask questions, capture the plan in a `TODO.*.md` primer + checklist, get the go-ahead, then execute. Keep that TODO file updated as you deliver slices.
- **Structure TODOs**: every `TODO.*.md` must start with a short Primer (goal, constraints, risks), followed by the raw checklist. Once the full list is captured, reorganize it under ordered `### Step N — title` sections so it reflects the execution sequence. Update steps as the plan evolves instead of dumping a flat list.
- **Pause before coding**: run a quick checklist—am I consuming tokens directly, using helpers (`paddings`, `borders`, `boxShadow`, etc.), and avoiding re-aliasing values? Don’t start writing styles until that answer is “yes”.
- **When unsure**: prefer shared helpers (`paddings`, `margins`, `borders`, `boxShadow`, `focusOutline`, typography, gradient helpers) over hand-written CSS; ask before large structural changes; keep slices small and shippable.
- **Never**: call `.css()` inside tokens/helpers or inline border/spacing shorthands when a helper exists; break `data-ui` contracts.

## Communication

- Ask for confirmation before invasive changes or restructuring—and raise
  questions or blockers as soon as you see them.
- Capture decisions/strategy in README/TODO files to create a shared reference.
- Note any lint errors unrelated to the current change so they can be addressed
  later.

## Refactor Checklist

1. Build the replacement alongside the existing path; confirm it works before removal.
2. Migrate consumers in small, verified batches, running checks after each step.
3. Only remove legacy code once every reference is swapped and tested. Rename files in a dedicated step for clean diffs.
