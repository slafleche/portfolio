---
name: style-helpers
description: Use when creating or editing styling helpers under src/styles/helpers, or when deciding whether logic belongs in a helper vs a token vs a style file. Triggers on tasks involving paddings, margins, borders, boxShadows, backdropFilters, gradients, measurement math, or "should this be a helper".
---

# Style helpers

Reusable styling logic and measurement math under `src/styles/helpers/`.

## Rules

- Encapsulate reusable styling logic and measurement math. Import tokens
  where needed.
- Expose named helpers (`paddings`, `margins`, `borders`, `boxShadows`,
  `backdropFilters`) that styles can call.
- Do not call `.css()` or emit CSS properties directly from helpers — that's
  the styles layer's job.
- Keep math in measurement space. Don't coerce to primitive numbers/strings
  inside helpers; coercion happens at adapter/emission boundaries via
  sanctioned css-calipers APIs.
- Guarded properties (`boxShadow`, `backdropFilter`) belong only in their
  dedicated helper implementations as allowed by `rules.yaml`, not in
  arbitrary helpers or component styles.
