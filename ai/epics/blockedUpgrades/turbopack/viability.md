# Turbopack viability

Waiting to see future updates to finally decide to switch over.

## Current stance

- Webpack is the only supported bundler for this project today; all branches and
  environments use webpack for both dev and build.
- Turbopack is explicitly *out of scope* for release-quality workflows until
  the requirements and blockers in this epic are addressed and we have a
  repeatable smoke-test that proves a Turbopack configuration is safe.

## Blocking (no path yet)

- [ ] vanilla-extract still depends on `@vanilla-extract/webpack-plugin`; no
      confirmed Turbopack integration for `.css.ts` yet.
- [ ] Currently, our `scripts/vanillaDebugLoader.cjs` only works with webpack.
      Not essential, but wait and see if we have support through Turbopack
      and/or vanilla-extract/Turbopack (note the goal isn't to have the same
      hook or keep similar code, the goal is to have better errors).
