# Turbopack epic (primer)

## Context

- Next 16 enables Turbopack by default for dev; this project currently forces
  webpack for `yarn dev` and has a `turbopack: {}` block in `next.config.js`.
- Styles use vanilla-extract via `@vanilla-extract/next-plugin`, which currently
  depends on a webpack plugin.
- `next.config.js` has custom webpack rules (debug loader, SVG, `.md`) that
  Turbopack will ignore.

## Goal

- Figure out when and how we can run dev/build on Turbopack without breaking
  styles or asset handling.

## References

- Next.js Turbopack configuration / migration docs.
- vanilla-extract documentation and any guidance on Next/Turbopack support.

