# Release workflow (privateLaunch)

This document documents the release flow

## Branches at a glance

- `main` — day-to-day work.
- `candidate/<slug>-x.y.z` — short-lived release candidates cut from `main` (for
  example, `candidate/update-systems-page-0.1.0`); safe to delete later.
- `staging` — demo branch; Vercel deploys this as the “staging” site.
- `release` — live branch; Vercel deploys this as the “production” site.

## Branch protections and behaviour

### main (`main`)

Local everyday workhorse and hub. I may or may not use `main` directly to update
other branches; it depends if I want to do it on GitHub or locally. In the end,
staging and release always get their own checks when they are updated.

Pre-commit:

- lint (full lint stack: base, rules, secrets, locales)
- can always bypass with `git commit --no-verify` if needed

GitHub CI (pushes and PRs into `main`):

- `ci:skipVideo`
  - `yarn generate:all:mockVideo`
  - `yarn verify`
  - `yarn build`

### Candidates (`candidate/<slug>-x.y.z`)

Short-lived branches for experiments and potential releases. These may or may
not become pull requests to `main`, `staging`, or `release`. They are where I
can try ideas, test on staging, and then either delete or promote them.

Pre-commit:

- lint (same full lint stack as `main`)
- tests are optional; I run them manually when I want to
- can bypass with `git commit --no-verify`

GitHub CI (pushes and PRs into `candidate/*`):

- `ci:skipVideo`
  - `yarn generate:all:mockVideo`
  - `yarn verify`
  - `yarn build`

### Staging (`staging`)

Vercel: staging site points to this branch. This is the first “serious” branch
that should behave like production.

Pre-commit:

- full publish stack (equivalent to `ci:full`):
  - `yarn generate:all`
  - `yarn verify`
  - `yarn build`
- can bypass with `git commit --no-verify` in emergencies, but the friction is
  intentional to encourage using PRs

GitHub CI (pushes and PRs into `staging`):

- `ci:full`
  - `yarn generate:all`
  - `yarn verify`
  - `yarn build`

### Release (`release`)

Vercel: live site points to this branch. The safest and “correct” path is to
test on `staging` first, then promote those changes into `release`, but in a
pinch I can also merge `main` or a candidate directly if needed.

Pre-commit:

- full publish stack (same as `staging` / `ci:full`):
  - `yarn generate:all`
  - `yarn verify`
  - `yarn build`
- can bypass with `git commit --no-verify` in emergencies

GitHub CI (pushes and PRs into `release`):

- `ci:full`
  - `yarn generate:all`
  - `yarn verify`
  - `yarn build`

### Uncharted branches (anything else)

Any other branch name is “uncharted”. These behave like normal playground
branches locally (no extra branch-specific constraints) and only pick up
stricter rules when changes are merged into `main`, `candidate/*`, `staging`,
or `release`, where the hooks and CI above apply.
