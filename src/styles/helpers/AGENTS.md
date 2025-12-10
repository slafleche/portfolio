# Agent Instructions for `src/styles/helpers`

This directory hosts shared styling helpers (measurement math, spacing
utilities, gradients, etc.).

## Responsibilities (`style-helpers`)

- Must: Encapsulate reusable styling logic and measurement math, importing
  tokens where needed.
- Must: Expose helpers that styles can call (for example, `paddings`, `margins`,
  `borders`, `boxShadows`, `backdropFilters`).

## Constraints (`style-helpers`, `architecture-layers`)

- Must: Do not call `.css()` or emit CSS properties directly from helpers.
- Must: Keep math in measurement space; avoid coercing to primitive
  numbers/strings inside helpers.
- Must: Respect import rules from `rules.yaml`: helpers may import tokens, but
  not modules or app code.
- Must: Keep guarded properties such as `boxShadow` and `backdropFilter` only in
  their dedicated helper implementations as allowed by `rules.yaml`, not in
  arbitrary helpers or component styles.

## Gradients and effects (`style-helpers`)

- Must: Centralize gradient, shadow, and filter logic behind helpers rather than
  duplicating raw CSS strings.
- Must: When adding a new effect, extend an existing helper or create a clearly
  named new helper instead of inlining CSS in styles.
