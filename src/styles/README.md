# Styles

- Emit all presentation via vanilla-extract (`*.css.ts`); this is the only layer that should import palettes or call `.css()`.
- Consume tokens, helpers, and modules to derive final selectors.
- Keep styles focused on selectors and theme composition; push reusable logic back into helpers/modules.
- Avoid exporting bare data from this layer—styles should return class names or global selectors.
- When adding a new component stylesheet, document any `data-ui` contracts or required wrappers.
