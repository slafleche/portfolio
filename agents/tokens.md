# Module: tokens

## Purpose

Keep design tokens as pure, structured data that can be safely consumed by helpers and styles.

## Key points

- Provide structured, typed token objects for the rest of the system.
- Do not import from `app/`, `modules/`, or `styles/` in tokens.
- Do not call `.css()` or emit CSS strings from tokens.
- Prefer grouped, pluralized bundles (`paddings`, `borders`, `boxShadows`, `fonts`, etc.) that feed directly into helpers.
- Do not coerce measurement values to primitive numbers/strings inside tokens; coercion only happens at adapter/emission boundaries using sanctioned MeasurementKit APIs.

