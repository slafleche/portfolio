---
name: localization
description: Use when adding, editing, or relocating user-visible copy. Triggers on tasks mentioning translations, locales, EN/FR strings, markdown content keys, abbreviation shortcodes ([abbr:TERM]), or files under src/lib/locales/. Also fires when running yarn locales or seeing locale lint warnings.
---

# Localization

All user-visible strings and localization logic live under `src/lib/locales/`.
Components are copy-agnostic.

## Rules

- Keep all user-visible strings under `src/lib/locales/`. Don't inline copy
  in components.
- Use established patterns: abbreviation shortcodes (`[abbr:TERM]`), rich-text
  types for structured content, `[split]` line breaks in SVG-headed strings.
- Don't hand-edit generated locale outputs under `src/lib/locales/generated/`.
  Use `yarn locales` (lint → markdown → publish) to regenerate.
- Keep locale utilities framework-agnostic. They should not depend directly
  on React components.
- New shortcodes (e.g. `abbr-*` entries) must be fully defined before use —
  builds fail on missing definitions.
- Keep `yarn lint:locales` passing. The optional pre-commit hook runs this
  on every commit (see `README.md`).

## Layout

- `src/lib/locales/sections/<name>.locale.ts` — section copy builders.
  Define keys + `build<Section>Copy(t)` factories. Mirror existing patterns
  (e.g. `approach.locale.ts`).
- `src/lib/locales/translations/en.data.ts`, `fr.data.ts` — string tables
  per locale.
- `src/lib/locales/translations/markdown/<locale>-<page>-<key>.md` —
  markdown body content, referenced via `markdownRefs('<key>')` in
  `*.data.ts`.
- `src/lib/locales/generated/` — generated artifacts. Do not edit.

## Adding a new locale string

1. Decide whether it's plain string, markdown, or shortcode-backed.
2. Add the key to the relevant section locale file under
   `src/lib/locales/sections/`.
3. Add the EN value to `en.data.ts` (and FR value to `fr.data.ts`).
4. If markdown-backed: create `<locale>-<page>-<key>.md` and reference via
   `markdownRefs('<key>')`.
5. Run `yarn locales` to regenerate the artifact and confirm lint passes.

For changes to user-visible text, see the `wizard` skill — agree on copy in
plain language before wiring keys.
