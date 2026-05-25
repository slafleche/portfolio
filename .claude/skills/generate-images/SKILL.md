---
name: generate-images
description: >-
  Use when the user says "generate images", "generate blog images", or
  "generate social images" (also "share images", "OG images"). Runs
  Playwright-based screenshot scripts that capture debug preview pages and
  output PNGs to the CDN source directory. Requires `yarn dev` to be running
  on port 3000.
---

# generate-images

Screenshot debug preview pages into CDN-ready PNGs using Playwright.

## Prerequisites

The dev server must be running on port 3000 (`yarn dev`). If it is not
running, tell the user to start it before proceeding.

## Commands

| What | yarn script (run from repo root) | Debug page |
|---|---|---|
| Social / OG images | `yarn --cwd cdn generate:img:share-images` | `/en/debug/shareImage` |
| Blog images | `yarn --cwd cdn generate:img:blog-images` | `/en/debug/blogImages` |

## Trigger phrases and what to run

- **"generate blog images"** - run the blog images command only.
- **"generate social images"**, **"generate share images"**,
  **"generate OG images"** - run the share images command only.
- **"generate images"** (no qualifier) - run both, share images first,
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

## After generating

The generated PNGs are local source files for the CDN image pipeline. To
process, upload, and update manifests, run the full image pipeline:
`yarn --cwd cdn generate:img` (interactive, prompts for target and sync).
