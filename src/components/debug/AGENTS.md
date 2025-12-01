# Agent Instructions for `src/components/debug`

This directory contains debug and sandbox components used during development.

## Responsibilities (`components-layer`, `debug-sandboxes`)

- Must: Use these components for development, inspection, and experimentation, not as production UI.
- Must: Keep debug components focused and self-contained so they do not become hidden dependencies for production features.

## Constraints (`debug-sandboxes`)

- Must: Clearly label debug-only components to avoid accidental reuse in production paths.
- Must: Avoid exporting patterns or helpers from debug components into production modules or components without a deliberate refactor.
- Must: Keep styling and logic local to each debug component so files can be removed without affecting shared modules or styles.

