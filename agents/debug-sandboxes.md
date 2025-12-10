# Module: debug-sandboxes

## Purpose

Keep debugging and experimental code isolated and disposable so it never becomes
accidental production surface.

## Key points

- Treat debug sandboxes and experimental components as disposable: keep styling
  and logic self-contained so files can be deleted once the feature stabilizes.
- Avoid sharing CSS or helpers from debug sandboxes into production modules or
  styles.
- Clearly label debug-only components to avoid accidental reuse in production
  paths.
