# Turbopack epic (primer)

## Context

- Next 16 enables Turbopack by default for dev; this project *intentionally*
  forces webpack for `yarn dev` (via `--webpack`) and does **not** enable
  Turbopack in `next.config.js`.
- Styles use vanilla-extract via `@vanilla-extract/next-plugin`, which currently
  depends on a webpack plugin.
- `next.config.js` has custom webpack rules (debug loader, SVG, `.md`) that
  Turbopack will ignore.

### Current decision (2025)

- All official workflows (local dev, CI, and Vercel builds for `main`,
  `candidate/*`, `staging`, and `release`) are expected to run on webpack,
  not Turbopack.
- Earlier experiments with Turbopack led to inconsistent behaviour between
  branches (for example, CI passing on `main`/`candidate/*` but failing on
  `staging`/`release`), which is unacceptable for publish branches.
- Until the requirements in `turbopack_requirements.md` and the blockers in
  `viability.md` are resolved, Turbopack is treated as *experimental only*:
  it may be mentioned and planned here in the epic, but must not be wired
  into default scripts, CI, or release flows.

## Goal

- Figure out when and how we *might eventually* run dev/build on Turbopack
  without breaking styles or asset handling, while keeping webpack as the
  stable, supported path until that point.

## References

- Next.js Turbopack configuration / migration docs.
- vanilla-extract documentation and any guidance on Next/Turbopack support.
