# Tokens

- Own only plain data objects suitable for reuse (measurements, font families,
  component defaults).
- Avoid importing palettes or calling `.css()` helpers; tokens should stay
  presentation-agnostic.
- Expose granular values so modules and styles can compose their own variants.
- When component-specific values are needed, keep them scoped but still
  data-only (no helper logic).
- Delete or relocate a token if it starts depending on runtime state or
  style-layer utilities.
