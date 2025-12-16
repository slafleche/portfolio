# Release workflow (privateLaunch)

This document captures the release flow for this portfolio so that future-you
does not have to remember all the moving parts. It assumes the
`privateLaunch` epic is in place.

No secrets live in this file; anything sensitive belongs in environment
variables (Vercel or local `.env`), not here.

## Branches at a glance

- `main` — day-to-day work.
- `candidate/<slug>-x.y.z` — short-lived release candidates cut from `main`
  (for example, `candidate/update-systems-page-0.1.0`); safe to delete later.
- `staging` — demo branch; Vercel deploys this as the “staging” site.
- `release` — live branch; Vercel deploys this as the “production” site.

## Scripts you’ll use

- `yarn publish`
  - Full “publish” check: runs `setup` (assets + video + locales) then
    `lint`, `lint:rules`, `test`, and `build`.
  - Used by CI for `staging`/`release` via `ci:publish`.
- `yarn ci:candidate`
  - Lightweight CI check for code health: `lint`, `lint:rules`, `test`.
  - Used by CI on `main` and `candidate/*` branches.
- `yarn ci:publish`
  - CI entrypoint for full publish checks on `staging` and `release`:
    `setup` → `lint` → `lint:rules` → `test` → `build`.

CI is configured in `.github/workflows/ci.yml` to run:

- `ci:candidate` on `main` and `candidate/*`.
- `ci:publish` (in addition) on `staging` and `release`.

## Gate and robots overview (no secrets)

The private gate and robots behavior are controlled entirely by env vars:

- HTTP Basic Auth:
  - `PRIVATE_LAUNCH_USER` — username for the browser’s Basic Auth prompt.
  - `PRIVATE_LAUNCH_PASSWORD` — long random password (only in env + password
    manager).
  - `PRIVATE_LAUNCH_ENABLED_STAGING` — if truthy, gate is enforced on
    `staging` deployments.
  - `PRIVATE_LAUNCH_ENABLED_RELEASE` — if truthy, gate is enforced on
    `release` deployments.
- Indexing:
  - `staging` and all preview deployments should always be configured to
    signal “do not index” (robots.txt and/or meta).
  - `release` should also be “do not index” by default and only allow
    indexing when a dedicated “production indexing allowed” env var is set
    to true in the production environment (exact name is defined alongside
    the implementation).

## Typical release flow

### 1. Prepare `main`

1. Work as usual on `main`.
2. Push your changes and let CI run `ci:candidate` on `main`:
   - Lint, lint rules, and tests must pass before you cut a candidate.
3. Optionally run `yarn publish` locally if you want to see the full pipeline
   succeed before creating a candidate.

### 2. Cut a candidate branch

1. From `main`, create a candidate branch:
   - `candidate/<slug>-x.y.z`, for example
     `candidate/update-systems-page-0.1.0`.
2. Push the candidate branch to GitHub.
3. CI will run `yarn ci:candidate` for that branch.
4. When CI is green and you are happy with the code, you can:
   - open a PR from the candidate into `staging`, or
   - merge it into `staging` using your normal workflow.
5. Optionally tag the candidate commit with a version tag like `v0.1.0` so
   you can always find that release later even if you delete the candidate
   branch.

### 3. Promote to `staging`

1. Merge the candidate branch into `staging` (or merge via PR).
2. CI runs `yarn ci:publish` on `staging`:
   - Regenerates assets (including video), runs lint + lint:rules + tests,
     then builds.
3. Vercel deploys the new `staging` build:
   - Gate is enforced if `PRIVATE_LAUNCH_ENABLED_STAGING` is truthy.
   - Staging always signals “do not index”.
4. Use the `staging` deployment URL to manually click through the site and
   confirm the release looks good.

### 4. Promote to `release`

1. Once `staging` looks good, merge `staging` into `release` (often via PR so
   you get another CI run).
2. CI runs `yarn ci:publish` on `release` again.
3. Vercel deploys the new `release` build:
   - Gate is enforced if `PRIVATE_LAUNCH_ENABLED_RELEASE` is truthy.
   - By default, `release` still signals “do not index” until you explicitly
     enable indexing via the production indexing env var.
4. Share the `release` deployment URL (and, later, the custom domain) with
   anyone who should see the site.

### 5. Going fully public (later)

When you are ready for the portfolio to be public:

1. Attach your GoDaddy domain to the `release` deployment in Vercel (if not
   already attached).
2. Turn off the gate for production by setting
   `PRIVATE_LAUNCH_ENABLED_RELEASE` to a falsey value in the production
   environment.
3. Once you are comfortable with the public behavior, enable indexing for
   production by setting the “production indexing allowed” env var to true:
   - Staging and previews should remain “do not index”.
4. Keep `staging` gated permanently, even after production is public, so you
   always have a private demo environment.

