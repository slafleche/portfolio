# Module: component-styles

## Purpose

Guide component-level vanilla-extract styles under `src/styles/components`.

## Key points

- Define selectors and visual states for components; do not embed business logic or React concerns in styles.
- Use helpers and tokens to express layout, spacing, borders, shadows, and backgrounds.
- Do not hand-write guarded properties (padding, margin, border, background, box-shadow, backdrop-filter) when a helper exists; route them through shared helpers.
- Keep selectors `&`-scoped where possible and avoid referencing other class names directly; use `globalStyle` or adjust markup when necessary.

