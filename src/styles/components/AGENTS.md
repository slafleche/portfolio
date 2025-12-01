# Agent Instructions for `src/styles/components`

This directory contains vanilla-extract component styles. These instructions refine `src/styles/AGENTS.md` for component-specific styles and apply to all `*.css.ts` files under this subtree.

## Responsibilities (`component-styles`)

- Must: Define selectors and visual states for components; do not embed business logic or React concerns in styles.
- Must: Use helpers and tokens to express layout, spacing, borders, shadows, and backgrounds instead of hard-coded values.

## CSS and helpers (`component-styles`, `style-helpers`)

- Must: Do not hand-write guarded properties (padding, margin, border, background, box-shadow, backdrop-filter) when a helper exists; route them through shared helpers.
- Must: Prefer gradient and shadow helpers over raw gradient or shadow strings when they exist.

## Selector rules (`component-styles`)

- Must: Keep selectors `&`-scoped where possible so styles remain local to the component.
- Must: Avoid referencing other class names directly; if needed, use `globalStyle` or adjust the markup instead.
