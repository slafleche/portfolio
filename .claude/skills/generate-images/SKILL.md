---
name: generate-images
description: >-
  Use when the user says "generate images", "generate blog images", or
  "generate social images" (also "share images", "OG images"). Also use
  when hero heading text changes (hero-title in locale data) since the
  heading is a generated SVG that must be rebuilt before screenshots.
  Covers the full pipeline: SVG rebuild, Playwright screenshots, CDN
  upload with --force, and manifest generation. Requires `yarn dev` on
  port 3000.
---

# generate-images

Screenshot debug preview pages into CDN-ready PNGs using Playwright.

## Prerequisites

The dev server must be running on port 3000 (`yarn dev`). If it is not
running, tell the user to start it before proceeding.

## Hero heading SVG rebuild

The share image (and the home page) renders the `hero-title` locale key
as a pre-generated SVG, not live text. When `hero-title` changes in
`src/lib/locales/translations/en.data.ts` or `fr.data.ts`, the SVGs
must be regenerated **before** screenshotting share images.

### Command

```
yarn build:hero-svg
```

Requires `yarn dev` running on port 3000 (the script captures text from
`/en/debug/heroHeadingSvg` via Playwright + Inkscape).

### What it does

1. Launches Playwright, navigates to the hero heading debug page.
2. Captures each locale/page heading as PDF, converts to SVG via
   Inkscape CLI.
3. Optimizes SVGs with SVGO (config: `svgo.heroHeading.config.mts`).
4. Applies text shadow from `.shadow.json` metadata files.
5. Converts final SVGs to React TSX components in
   `src/assets/SVG/generated/` (e.g. `home-en-heroHeading.gen.tsx`).
6. Writes the barrel `headingsAsSvgs.ts` with locale-keyed imports.

### Source files

- Script: `scripts/buildHeroHeadingSvg.mts`
- Capture: `scripts/generateSvgFromHeroText.mjs`
- SVGO config: `svgo.heroHeading.config.mts`
- Shadow metadata: `/tmp/heroTextSvg/{page}/svgs/*.shadow.json`
- Output: `src/assets/SVG/generated/*.gen.tsx`

### Locale keys that affect the SVG

- `hero-title` in `en.data.ts` / `fr.data.ts` (uses `[split]` for
  line break)
- The share image debug page (`app/[LOCALE]/debug/shareImage/page.tsx`)
  renders the Hero component with `hideSubtitle={true}`, so only the
  SVG title is visible in generated share images.

## Screenshot commands

| What | yarn script (run from repo root) | Debug page |
|---|---|---|
| Social / OG images | `yarn --cwd cdn generate:img:share-images` | `/en/debug/shareImage` |
| Blog images | `yarn --cwd cdn generate:img:blog-images` | `/en/debug/blogImages` |

## Trigger phrases and what to run

- **"generate blog images"** -- run the blog images command only.
- **"generate social images"**, **"generate share images"**,
  **"generate OG images"** -- run the share images command only.
- **"generate images"** (no qualifier) -- run both, share images first,
  then blog images.

## What happens

Each script:

1. Launches headless Chromium via Playwright.
2. Navigates to the debug page on localhost:3000.
3. Waits for fonts and network idle.
4. Finds all elements with the viewport data attribute
   (`data-target="share-image-viewport"` or
   `data-target="blog-image-viewport"`).
5. Screenshots each viewport element to a `.gen.png` file.

### Output directories

- Share images: `cdn/media/images/localImageSrc/share-images/`
  - Files: `{locale}-share-image-{width}x{height}.gen.png`
- Blog images: `cdn/media/images/localImageSrc/blog-images/`
  - Files: `{id}-{width}x{height}.gen.png`

## Adding a new blog image

Add an entry to the `BLOG_IMAGES` array in
`app/[LOCALE]/debug/blogImages/page.tsx` with an `id` and `titleLines`,
then re-run the blog images command.

## CDN upload and manifest pipeline

After generating PNGs, push them to the CDN and update manifests.

### Step-by-step (non-interactive)

```bash
# 1. Process images for CDN (resize, format, hash)
yarn --cwd cdn generate:img:files --target=both

# 2. Upload to CDN (--yes skips prompts)
yarn --cwd cdn cdn:sync --images --yes --target=both

# 3. Generate manifest artifacts for the app
yarn --cwd cdn generate:img:artifacts --target=both
```

### What each step does

1. **generate:img:files** -- reads source PNGs from
   `cdn/media/images/localImageSrc/`, produces optimized variants under
   `tmp/cdn/{_staging,release}/images/v1/`, writes local manifests and
   hash files. Skips unchanged images by content hash.
2. **cdn:sync** -- uploads processed images to R2. Image content is
   hashed into the CDN key, so changed images get new keys and are
   uploaded automatically; unchanged images are skipped. Only add
   `--force` if the user explicitly asks to re-upload everything.
   Writes manifests to
   `public/cdn/images/manifest.{_staging,release}.json`.
3. **generate:img:artifacts** -- writes generated manifest JSON into
   `src/data/generated/{_staging,release}/images/`.

### Targets

- `_staging` -- staging CDN prefix
- `release` -- production CDN prefix
- `both` -- both (default for most workflows)

### Interactive alternative

`yarn --cwd cdn generate:img` runs the full pipeline with interactive
prompts for target selection, sync confirmation, and overwrite
confirmation.

## Full workflow: hero text change to CDN

When the user changes hero heading copy and wants updated share images
on the CDN:

1. Edit `hero-title` in `en.data.ts` / `fr.data.ts`
2. `yarn build:hero-svg` (rebuild SVG components)
3. Verify in browser (dev server hot-reloads)
4. `yarn --cwd cdn generate:img:share-images` (screenshot)
5. `yarn --cwd cdn generate:img:files --target=both` (process)
6. `yarn --cwd cdn cdn:sync --images --yes --target=both` (upload changed only)
7. `yarn --cwd cdn generate:img:artifacts --target=both` (manifests)
