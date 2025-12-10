# Module: architecture-layers

## Purpose

Preserve the token → helper → module → style layering so styling and behavior
stay predictable and enforceable.

## Key points

- Tokens are pure data (measurements, colors, fonts) with no `.css()` and no
  imports from app/modules/styles.
- Helpers perform measurement math and shared styling logic; they do not emit
  CSS properties directly.
- Modules glue tokens + helpers together for features while staying CSS-free.
- Styles (vanilla-extract `*.css.ts`) are the only place that emit CSS and call
  `.css()`, and they should rely on helpers where available.
