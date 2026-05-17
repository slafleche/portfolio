---
name: components-layer
description: Use when creating or editing React components under src/components. Triggers on file paths in src/components/**/*.{tsx,ts}, on tasks like "add a new component", "refactor this component", or questions about where logic should live (component vs module vs helper).
---

# Components layer

React components under `src/components` are focused, accessible, and aligned
with the token → helper → module → style layering.

## Rules

- Implement accessible, focused UI components using tokens, helpers, and
  modules rather than duplicating styling or business logic.
- Keep components small and composable. Push complex transformations into
  `src/modules/` or helper functions.
- Prefer consuming modules and helpers for layout and visual decisions
  instead of inlining CSS-like logic.
- Don't create ad-hoc styling systems. Integrate with the existing
  tokens/helpers/styles pipeline.
- Component-level CSS lives under `src/styles/components` (see the
  `component-styles` skill). Components import their styles from there; they
  do not embed `.css()` calls.
