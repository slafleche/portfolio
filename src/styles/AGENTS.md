# Agent Instructions for `src/styles`

This file applies to all style-layer code under `src/styles` unless overridden
by a more specific `AGENTS.md` in a subdirectory. Component styles and helpers
have additional, more specific rules in their own `AGENTS.md` files.

## Layering and imports (`styles-layer`, `architecture-layers`)

- Must: Treat `src/styles` as the style layer that sits above tokens and
  helpers.
- Should: Prefer importing shared helpers and tokens rather than reintroducing
  raw CSS strings or magic numbers.
- Must: Respect the import constraints in `rules.yaml` (no importing app/modules
  from styles).

## CSS and helpers (`styles-layer`, `style-helpers`)

- Must: Only vanilla-extract `*.css.ts` files should emit CSS and call `.css()`.
- Must: Keep layout and visual properties flowing through helpers (`paddings`,
  `margins`, `borders`, `boxShadows`, `backdropFilters`, gradients, typography)
  rather than manual shorthands.
- Must: Not be re-aliasing token values; consume them directly unless applying a
  real transformation.
- Must: When tokens expose structured bundles, pass them through the
  corresponding helpers (for example, `borders(...)`,
  `backdropFilters.style(...)`) instead of exploding them into individual CSS
  properties.

## Selectors and structure (`component-styles`)

- Must: Keep selectors scoped and predictable; avoid complex cross-component
  selector chains.
- Must: If a style needs to interact with external markup (global resets,
  typography), prefer `globalStyle` and clearly mark it as such.
