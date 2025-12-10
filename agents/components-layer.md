# Module: components-layer

## Purpose

Guide React components under `src/components` to stay focused, accessible, and
aligned with the architecture layers.

## Key points

- Implement accessible, focused UI components using tokens, helpers, and modules
  rather than duplicating styling or business logic.
- Keep components small and composable; push complex transformations into
  `src/modules` or helper functions.
- Prefer consuming modules and helpers for layout and visual decisions instead
  of inlining CSS-like logic.
- Avoid creating new ad-hoc styling systems; integrate with the existing
  tokens/helpers/styles pipeline.
