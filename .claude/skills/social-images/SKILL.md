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
`app/[LOCALE]/debug/blogImages/page.tsx`, then run `yarn build:blog-images`.

Entry fields:

- `id` (required) — used in the output filename.
- `titleLines` (required) — array of strings, one per rendered line. Use the
  `'[br]'` marker entry to insert a paragraph gap (instead of a full blank
  line) between lines.
- `sizes` (optional) — restrict output to specific sizes, e.g.
  `['1200x630']` for LinkedIn only. Omit to render all `BLOG_IMAGE_SIZES`.
- `fontSize` (optional) — override the title font size in px for this image
  only. Defaults to `DEFAULT_TITLE_FONT_SIZE` (60). Line height and paragraph
  gap scale with it automatically, so other images are unaffected.

### Font size and padding

The `fontSize` value is specified at the reference width
(`TITLE_REFERENCE_WIDTH` = 1200, the LinkedIn size) and is scaled down
proportionally for narrower sizes (e.g. 1000x420 dev.to). This keeps the text
filling the same fraction of the frame across every size, so the side padding
looks consistent — you tune one number, not one per size.

Each title is an SVG with a fixed viewBox width (`imageWidth * 0.9`). If a
line is wider than the viewBox it gets **clipped** (edges cut off), it does
not auto-shrink. So `fontSize` has a ceiling: too high and the longest line
clips. Default-size (60px) titles are short two-liners; long titles need a
smaller override (the `dreamweaver-mistake` entry uses ~40).

Workflow for a new title: start near the default, regenerate, and **read the
generated PNGs for every size** the image produces. Raise `fontSize` to fill
more of the frame, lower it if any line clips.

Leave a comfortable margin on both sides — do not size text right up to the
edges. Social platforms crop these images responsively (different aspect
ratios per surface), so text that touches the edge will be cut on some
displays. Aim for clear padding around the whole text block.

## Trigger phrases

- "generate social images"
- "generate blog images"
- "social images"

## Important

These images are NOT part of the CDN pipeline. Do not run
`generate:img:files`, `cdn:sync`, or `generate:img:artifacts` for
these images.
