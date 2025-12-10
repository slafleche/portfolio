# Module: modules-layer

## Purpose

Define how feature modules under `src/modules` assemble tokens and helpers
without taking on styling responsibilities.

## Key points

- Prepare structured configuration and view models for components to consume.
- Keep logic focused on composition and data shaping rather than rendering or
  layout.
- Do not call `.css()` or define vanilla-extract styles in modules.
- Respect import rules from `rules.yaml`: modules may depend on helpers and
  tokens, but not on `src/styles/components` or `app/`.
- Avoid global side effects; keep behavior feature-scoped and testable.
