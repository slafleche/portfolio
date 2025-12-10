# Module: style-helpers

## Purpose

Shape reusable styling logic and measurement math under `src/styles/helpers`.

## Key points

- Encapsulate reusable styling logic and measurement math, importing tokens
  where needed.
- Expose helpers that styles can call (for example, `paddings`, `margins`,
  `borders`, `boxShadows`, `backdropFilters`).
- Do not call `.css()` or emit CSS properties directly from helpers.
- Keep math in measurement space; avoid coercing to primitive numbers/strings
  inside helpers.
- Guarded properties such as `boxShadow` and `backdropFilter` belong only in
  their dedicated helper implementations as allowed by `rules.yaml`, not in
  arbitrary helpers or component styles.
