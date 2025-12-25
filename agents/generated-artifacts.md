# Module: generated-artifacts

## Purpose

Prevent accidental hand-edits to generated files and keep all generated outputs
reproducible via scripts.

## Key points

- Treat generated artifacts as disposable outputs:
  - `src/data/generated/`
  - `src/data/generated/**` examples:
    `src/data/generated/favicons/manifest.favicons.gen.ts`,
    `src/data/generated/fonts/googleFonts.gen.ts`,
    `src/data/generated/_staging/images/manifest.images.gen.json`,
    `src/data/generated/release/images/manifest.images.gen.json`,
    `src/data/generated/_staging/videos/manifest.videos.gen.json`,
    `src/data/generated/release/videos/manifest.videos.gen.json`,
    `src/data/generated/_staging/fonts/manifest.fonts.gen.json`,
    `src/data/generated/release/fonts/manifest.fonts.gen.json`,
    `src/data/generated/_staging/fonts/config.fonts.gen.json`,
    `src/data/generated/release/fonts/config.fonts.gen.json`,
    `src/data/generated/minimalFontText.gen.ts`
  - `src/styles/fontFaces.*.css.ts`
  - `public/styles/fontFaces.*.gen.css`
  - `src/lib/locales/generated/`
  - `public/favicons/` and other assets generated under `public/` by scripts
- Do not hand-edit generated files; instead, run the appropriate scripts
  (`yarn favicons`, fonts/locale generators, setup scripts) to update them.
- When behavior needs to change, update source inputs or generator scripts
  instead of patching generated outputs.
