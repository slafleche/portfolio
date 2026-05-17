# `src/styles` — style layer

Style layer that sits above tokens and helpers. See root `CLAUDE.md` for the
full token → helper → module → style layering. Directory-specific points:

- Only vanilla-extract `*.css.ts` files emit CSS and call `.css()`.
- Respect `rules.yaml` import constraints — no importing `app/` or
  `modules/` from styles.
- Layout and visual properties (paddings, margins, borders, boxShadows,
  backdropFilters, gradients, typography) flow through helpers, not manual
  shorthands.
- Don't re-alias token values; consume them directly unless applying a real
  transformation.
- When tokens expose structured bundles, pass them through the corresponding
  helpers (e.g. `borders(...)`, `backdropFilters.style(...)`) instead of
  exploding into individual CSS properties.
- Keep selectors scoped and predictable. For interactions with external
  markup (global resets, typography), use `globalStyle` and mark it
  explicitly.

Subdirectories (`components/`, `helpers/`) have their own `CLAUDE.md` files
with additional rules.
