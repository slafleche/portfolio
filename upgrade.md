# Next.js upgrade — 16.1.1 → 16.2.6

## Why

Security patch. Latest advisory cluster (May 6–7, 2026) includes several High-severity issues; the most recent is **GHSA-26hh-7cqf-hhc6** (middleware/proxy bypass via segment-prefetch routes, incomplete-fix follow-up). Fixed in **16.2.6** for the 16.x line.

## What changed

- `package.json` declares `"next": "^16.0.7"` (unchanged caret).
- `yarn.lock` resolves `next` from `16.1.1` → `16.2.6`. Companion `@next/swc-*` and `@next/env` bumped to `16.2.6`.
- No other dependency changed.

## Compatibility analysis (this repo)

### Next-adjacent dependencies
| Package | Version | Peer dep on `next` | Status |
|---|---|---|---|
| `@vanilla-extract/next-plugin` | 2.4.17 | `>=12.1.7` | Compatible. The plugin is intentionally permissive on Next versions. |
| `@vanilla-extract/webpack-plugin` | 2.3.25 (transitive) | requires `webpack` peer | Pre-existing missing-peer warning, unrelated to Next. Resolves transitively because Next bundles webpack. |

### React stack
- `react` / `react-dom` are at `^19.2.1`, which satisfies Next 16.2.6's peer `^18.2.0 || ^19.0.0`. No action needed.

### Build configuration
- Build script uses `next build --webpack`, opting out of Turbopack. Likely deliberate to keep `@vanilla-extract/next-plugin` working (the plugin is webpack-bound). No change needed for this upgrade.
- Vercel knowledge note: Edge Functions are deprecated in favor of Fluid Compute on the platform. This repo does not appear to use Edge runtime, so the upgrade is unaffected.

### No `eslint-config-next`
- This repo uses a hand-rolled flat ESLint config rather than `eslint-config-next`. Nothing to bump.

## Verification performed

- `yarn up next@16.2.6` succeeded.
- `yarn explain peer-requirements` flagged only ONE actual ✘ (`@vanilla-extract/next-plugin` not providing `webpack` to `@vanilla-extract/webpack-plugin`). This is **pre-existing** and unrelated to the Next upgrade.
- `yarn typecheck` clean (after running `yarn locales` to create the gitignored `src/lib/locales/generated/html.gen.ts` artifact).
- Lockfile diff inspected: only `next` family packages changed.

- `yarn test` (vitest): **460/460 passed**.
- `yarn test:e2e` (Playwright visual regressions across viewports × locales × pages): **20/20 passed in 1.7 min** (after removing a stale `.next/dev/lock` and installing the missing chromium binary via `yarn playwright install chromium`).

Not yet performed (run if you want a stricter signal):
- `yarn build` (full Next webpack build)

## Cross-repo / shared concerns

This is one of nine Next.js repos in the same workspace receiving this patch. Notes that may matter across the set:

- **Same advisory cluster, different patched targets**: 15.x repos need `15.5.18`; 16.x repos need `16.2.6`. No major-version migrations are required anywhere.
- **`portfolio` is the lightest repo to upgrade**: no Payload CMS, no `eslint-config-next`, no `next-intl`. Treat its outcome as a baseline, not as a guarantee for the Payload-based repos.
- **Node engine drift**: this repo pins `node: 20.x`. The Payload repos pin `22.x` or `>=22.9.0`. Vercel's current default is Node 24 LTS. Not a blocker for this patch but worth aligning eventually.
- **Package-manager drift across the set**: `portfolio` is the only Yarn 4 repo. Most others are pnpm 10.x; one is Bun. Each upgrade has its own lockfile semantics.

## Recommended follow-ups (non-blocking)

- Optionally widen `package.json` to pin or align on `^16.2.6` to make the security floor explicit (current caret already permits it, but doesn't enforce it).
- Optionally bump `engines.node` to `>=20.18` to match Vercel's recommended floor.
- Run `yarn build` end-to-end before deploy.

## Risk assessment

**Low.** Patch-level bump within the 16.x line. No API changes, no codemods, no peer-dep breakage. The single internal warning (vanilla-extract / webpack) was already present before this change.
