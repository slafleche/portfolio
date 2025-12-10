# Agent Instructions for `src/components`

This directory contains React components and related UI logic.

## Responsibilities (`components-layer`)

- Must: Implement accessible, focused UI components using tokens, helpers, and
  modules rather than duplicating styling or business logic.
- Must: Keep components small and composable; push complex transformations into
  `src/modules` or helper functions.

## Styling and layout (`components-layer`, `styles-layer`)

- Must: Prefer consuming modules and helpers for layout and visual decisions
  instead of inlining CSS-like logic.
- Must: Avoid creating new ad-hoc styling systems; integrate with the existing
  tokens/helpers/styles pipeline.

## Debug and experimental components (`components-layer`, `debug-sandboxes`)

- Must: Treat debug sandboxes and experimental components as disposable; keep
  their styling and logic self-contained so they can be removed without
  affecting shared modules.
- Must: Clearly label any debug-only components to avoid accidental reuse in
  production paths.
