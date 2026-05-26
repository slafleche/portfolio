# social-images

Generate social media images (blog post banners, etc.) by screenshotting
the debug blog images page. These are for personal use, not hosted on
Cloudflare CDN.

## Prerequisites

The dev server must be running on port 3000 (`yarn dev`). If it is not
running, tell the user to start it before proceeding.

## Command

```bash
yarn build:blog-images
```

## What happens

1. Launches headless Chromium via Playwright.
2. Navigates to `http://localhost:3000/en/debug/blogImages`.
3. Waits for fonts and network idle.
4. Screenshots each `[data-target="blog-image-viewport"]` element.
5. Saves PNGs to `tmp/blog-images/`.

## Output

- Location: `tmp/blog-images/`
- Naming: `{id}-{width}x{height}.gen.png`
- Sizes: 1200x630 (LinkedIn) and 1000x420 (dev.to)

## Adding a new image

Add an entry to the `BLOG_IMAGES` array in
`app/[LOCALE]/debug/blogImages/page.tsx` with an `id` and `titleLines`,
then run `yarn build:blog-images`.

## Trigger phrases

- "generate social images"
- "generate blog images"
- "social images"

## Important

These images are NOT part of the CDN pipeline. Do not run
`generate:img:files`, `cdn:sync`, or `generate:img:artifacts` for
these images.
