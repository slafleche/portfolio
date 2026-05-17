# `src/styles/components` — vanilla-extract component styles

Refines `src/styles/CLAUDE.md` for component-specific styles. Applies to all
`*.css.ts` files under this subtree. Also see the `component-styles` skill.

- Define selectors and visual states. No business logic, no React concerns.
- Use helpers and tokens for layout, spacing, borders, shadows, backgrounds —
  no hard-coded values.
- Don't hand-write guarded properties (padding, margin, border, background,
  box-shadow, backdrop-filter) when a helper exists. Route them through
  shared helpers in `src/styles/helpers/`.
- Prefer gradient and shadow helpers over raw gradient/shadow strings.
- Keep selectors `&`-scoped where possible. Avoid referencing other class
  names directly; use `globalStyle` or adjust markup if cross-class
  targeting is unavoidable.
