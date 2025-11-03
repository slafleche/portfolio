# Component Tokens

- Gather project-specific bundles of design tokens for easy consumption by styles and helpers.
- Prefer importing raw tokens from `/tokens` and reshaping them here rather than defining new values from scratch.
- Keep this directory focused on configuration—avoid heavy helper logic or calculations.
- If data needs computation, perform it in a helper and expose the result back through these component token modules.
