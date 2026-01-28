# Visual regression (Playwright + Storybook + Chromatic)

This repo uses a small custom pipeline to make full-page *Next.js* renders show
up as images inside *Storybook*, so *Chromatic* can review them alongside normal
component stories.

## What gets generated

### Page render PNGs (used by Storybook “Pages/*” stories)

- Generator: `tests/e2e/pages.visual.spec.ts`
- Output dir: `public/pages-renders/`
- Output filenames: `{locale}-{variant}-{width}.png` (example: `en-home-320.png`)

Those PNGs are consumed by Storybook stories like:

- `src/components/stories/Page.Home.stories.tsx`
- `src/components/stories/Page.Home.FR.stories.tsx`
- `src/components/stories/Page.Systems.stories.tsx`
- `src/components/stories/Page.Systems.FR.stories.tsx`

Each story loads an `<img>` from the `/pages/*` URL space.

## How Storybook serves them

Storybook is configured to map the generated folder into `/pages`:

- `.storybook/main.ts` maps `public/pages-renders/` → `/pages`

So if `public/pages-renders/en-home-320.png` exists on disk, Storybook can load
it from `/pages/en-home-320.png`.

## How CI wires it into Chromatic (no duplication)

CI builds page renders once, uploads them as an artifact, and Chromatic
downloads them before building Storybook.

- CI workflow: `.github/workflows/ci.yml`
  - Job `page-renders`:
    - runs `yarn test:e2e pages.visual.spec.ts`
    - uploads `public/pages-renders/` as artifact `page-renders`
  - Job `chromatic`:
    - `needs: page-renders`
    - downloads artifact `page-renders` into the workspace (so
      `public/pages-renders/` exists)
    - runs `yarn build-storybook`
    - publishes Storybook to Chromatic

## Running locally

1. Generate page renders (writes into `public/pages-renders/`):
   - `yarn test:e2e pages.visual.spec.ts`

2. View them in Storybook:
   - `yarn storybook`
   - Open “Pages/Home/*” or “Pages/Systems/*”

### Using an existing dev server

If you already have Next running on `http://localhost:3000`, you can reuse it:

- `PLAYWRIGHT_REUSE_EXISTING=1 PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_PORT=3000 yarn test:e2e pages.visual.spec.ts`

## Common failure modes

### “Pages/*” images are broken in Storybook/Chromatic

- Locally: check that `public/pages-renders/` contains the expected PNGs.
- In CI: confirm `page-renders` ran and `chromatic` downloaded the `page-renders`
  artifact before `yarn build-storybook`.

### “Page curl” image missing only in Playwright

The curl image is below the fold (in the footer). The Playwright render suite
scrolls to `#contact` before taking the full-page screenshot so lazy-loaded
footer assets are actually requested.

