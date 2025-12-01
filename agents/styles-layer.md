# Module: styles-layer

## Purpose

Define expectations for the overall `src/styles` layer above tokens and helpers.

## Key points

- `src/styles` is the style layer that sits above tokens and helpers.
- Respect import constraints from `rules.yaml` (no importing app/modules from styles).
- Only vanilla-extract `*.css.ts` files should emit CSS and call `.css()`.
- Keep layout and visual properties flowing through helpers (`paddings`, `margins`, `borders`, `boxShadows`, `backdropFilters`, gradients, typography) rather than manual shorthands.

