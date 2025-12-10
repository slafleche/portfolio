# Module: generated-artifacts

## Purpose

Prevent accidental hand-edits to generated files and keep all generated outputs
reproducible via scripts.

## Key points

- Treat generated artifacts as disposable outputs:
  - `src/data/generated/`
  - `src/data/*.gen.*` (e.g., `favicons.manifest.gen.ts`, `googleFonts.gen.ts`,
    `images.manifest.gen.json`, `videos.manifest.gen.json`,
    `minimalFontText.gen.ts`)
  - `src/lib/locales/generated/`
  - `public/favicons/` and other assets generated under `public/` by scripts
- Do not hand-edit generated files; instead, run the appropriate scripts
  (`yarn favicons`, fonts/locale generators, setup scripts) to update them.
- When behavior needs to change, update source inputs or generator scripts
  instead of patching generated outputs.
