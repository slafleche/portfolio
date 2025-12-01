# Agent Instructions for `src/styles/componentTokens`

This directory contains component-specific token bundles that feed style helpers.

## Token bundles (`tokens`, `styles-layer`)

- Must: Define structured token bundles (for example, `paddings`, `borders`, `boxShadows`, `backgrounds`) that can be passed directly to helpers.
- Must: Keep these files free of `.css()` calls and vanilla-extract usage; they are data, not styles.

## State shaping (`tokens`)

- Must: Keep bundle shapes consistent across states (for example, base/hover/focus/active share the same nested keys) so styles can swap states without learning a new structure.
- Must: Avoid mixing raw CSS strings or numbers with MeasurementKit values inside the same bundle; stay in measurement space until helpers emit CSS.

## Imports and usage (`style-helpers`, `styles-layer`)

- Must: Import MeasurementKit utilities and shared helpers as needed, but do not import React/components/modules/app code here.
- Must: Expect consumers in `src/styles/components` to spread these bundles into helpers rather than exploding them into manual CSS properties.

