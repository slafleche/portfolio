# Requirements — `turbopack`

This file tracks the external conditions that must be met before we can safely
move dev/build workflows from webpack to Turbopack.

- [ ] vanilla-extract (and `@vanilla-extract/next-plugin` or equivalent)
      documents first-class Turbopack support for `.css.ts` files, or an
      officially recommended migration path away from the webpack plugin.
- [ ] Next.js Turbopack supports our custom asset patterns (SVG, `.md`, debug
      loader equivalents) or we have documented replacements that keep the same
      ergonomics.
- [ ] A small, documented smoke-test (for example, `yarn dev` and `yarn build`
      with Turbopack enabled) that we can run locally and in CI to validate the
      Turbopack configuration before switching defaults.
