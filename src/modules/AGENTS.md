# Agent Instructions for `src/modules`

Modules assemble tokens and helpers into feature-specific structures without emitting CSS.

## Responsibilities (`modules-layer`)

- Must: Prepare structured configuration and view models for components (including styles) to consume.
- Must: Keep module logic focused on composition and data shaping rather than rendering or layout.

## Constraints (`modules-layer`, `architecture-layers`)

- Must: Do not call `.css()` or define vanilla-extract styles in modules.
- Must: Respect import rules from `rules.yaml`: modules may depend on helpers and tokens, but not on `src/styles/components` or `app/`.
- Must: Avoid global side effects; keep behavior feature-scoped and testable.
