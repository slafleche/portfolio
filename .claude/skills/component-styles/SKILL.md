---
name: component-styles
description: Use when editing or creating vanilla-extract component styles under src/styles/components. Triggers on file paths matching src/styles/components/**/*.css.ts, on tasks involving selectors / visual states for a component, or on questions about how component-level styling should be structured.
---

# Component styles

Component-level vanilla-extract styles under `src/styles/components` define
selectors and visual states. They do not contain business logic or React
concerns.

## Rules

- Define selectors and visual states. No business logic, no React concerns.
- Use helpers and tokens for layout, spacing, borders, shadows, backgrounds.
- Do not hand-write guarded properties (`padding`, `margin`, `border`,
  `background`, `box-shadow`, `backdrop-filter`) when a helper exists — route
  them through the shared helpers in `src/styles/helpers/`.
- Keep selectors `&`-scoped where possible. Avoid referencing other class
  names directly. Use `globalStyle` or adjust markup when cross-class
  targeting is unavoidable.
- Only `*.css.ts` files emit CSS (call `.css()`). Modules and components do
  not.
