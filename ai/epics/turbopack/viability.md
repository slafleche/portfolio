# Turbopack viability

Waiting to see future updates to finally decide to switch over

## Blocking (no path yet)

- [ ] vanilla-extract still depends on `@vanilla-extract/webpack-plugin`; no
      confirmed Turbopack integration for `.css.ts` yet.
- [ ] Currently, our `scripts/vanillaDebugLoader.cjs` only works with webpack.
      Not essential, but wait and see if we have support through Turbopack
      and/or vanilla-extract/Turbopack (note the goal isn't to have the same
      hook or keep similar code, the goal is to have better errors)
