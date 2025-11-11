# Portfolio site for slafleche

## Stack

- Components with [React](https://reactjs.org/)
- JS Framework by [Next.js](https://nextjs.org/)
- Styles [Vanilla-Extract](https://vanilla-extract.style/)
- Accessible components by [Reach UI](https://reach.tech/)
- CSS in JS made with [Vanilla-Extract](https://vanilla-extract.style/)

## Features

- Accessibility in mind
- Responsive

### Helper Conventions

- Require MeasurementKit values for anything that represents a scalar (lengths,
  angles, timings). Use MK’s APIs (`add`, `subtract`, `multiply`, `divide`,
  `round`, `floor`, `ceil`, `clamp`, etc.) instead of CSS math functions
  (`calc`, `min`, `max`, `clamp`). Emit once you reach the style layer and rely
  on the shared helpers—`paddings`, `margins`, `borders`, `boxShadow`, etc.—to
  turn structured data into CSS.
- When you need those symbolic values, define a dedicated type in
  `src/styles/helpers/types.helper.ts` instead of falling back to loose unions.
  `SpacingKeyword` is the reference example: it extracts the string-only portion
  of `CSS_TYPES.Property.Margin` and allows `spacing.helper.ts` to accept `auto`
  alongside real measurements without reopening the old `MeasurementLike` escape
  hatch.
- Spacing helpers accept either structured intent objects or shorthand
  MeasurementKit/spacing keyword values. Use `{ all: ... }`,
  `{ horizontal: ..., vertical: ... }`, etc., whenever you need axis overrides,
  but never pass raw numbers or strings—the helper will throw unless the value
  is a MeasurementKit instance or one of the approved spacing keywords.

### Token Structure

- Group reusable measurements/colors into pluralized helper bundles (e.g.,
  `paddings`, `borders`, `boxShadows`) so styles can spread them straight into
  the helpers without rebuilding shorthands by hand.
- When a component needs state-specific overrides (hover, focus, active, etc.),
  nest each state under its own key and reuse the same bundle names inside —
  `hover.boxShadows`, `focus.borders`, `active.backgrounds`, etc. Every override
  mirrors the base shape so swapping states never requires learning a new token
  layout.
- Avoid leaking scalar shorthands (`paddingInline`, `shadowColor`, …) out of the
  token layer. Keep measurements grouped until the helper emits CSS in the style
  layer.

### Localization — Abbreviation Shortcodes

- Authors can mark abbreviations inline via `[abbr:TERM]` in any locale string.
  The locale loader resolves those tags before components render, so the UI sees
  trusted HTML (`<abbr title="…">…</abbr>`) rather than raw shortcodes.
- Slugs are deterministic: we lowercase the term, preserve punctuation such as
  `&`, and prefix `abbr-`. Always reuse the canonical slug (e.g., `[abbr:AI]`
  everywhere) even when the rendered label changes per locale; translators can
  override `label`/`definition` inside the `abbr-*` entries.
- Dev/CI builds throw when a slug is missing or its definition is empty; prod
  degrades gracefully by stripping the shortcode and logging once. Add the
  locale data (`abbr-…` entry) before using a new shortcode to avoid surprises.
- The shortcode parser also runs across Markdown content and plain locale
  strings, so components stay “dumb”—they accept either plain strings or the
  branded rich text emitted by the loader without reimplementing parsing logic.

### Linting & Guardrails

- `rules.yaml` is the machine-readable source of truth for all hard rules (layering,
  helper usage, TODO cadence, forbidden properties). ESLint consumes it via
  `eslint/rules.mjs`, and the `custom/forbidden-property` rule surfaces friendly
  `file:line:col` errors (e.g., “Use `backdropFilters.style()`…”) instead of
  cryptic stack traces whenever a guarded property appears outside its helper.
- `lint-staged` now runs `node scripts/checkLintRules.mjs` after prettier/eslint
  to catch disallowed imports or raw background/border/padding/margin props in
  staged files. Fix violations before committing.
- Keep `ai.md` for narrative context, but treat `rules.yaml` + the automated checks
  as canonical—if you change the rules, update the YAML and the lint scripts in
  the same slice.

### Setup

- Run `yarn fresh` after cloning. This installs dependencies and runs the full
  asset pipeline (`copy:html`, fonts, images, and video variants) so generated
  files are up to date.
- Use `yarn setup` whenever locale copy or asset sources change and you need to
  regenerate everything without reinstalling dependencies.
- Start the dev server with `yarn dev`.
- When updating `fonts.config.json`, regenerate the Google Fonts URL bundle and
  optionally verify that each generated URL resolves:
  ```bash
  yarn fonts:urls                    # rebuild src/data/generated/googleFonts.gen.ts
  VERIFY_FONT_URLS=true yarn fonts:urls  # repeat with live HEAD checks against Google Fonts
  ```
- Enable the locale guardrail pre-commit hook so commits fail when markdown
  translations are missing:
  ```bash
  cp scripts/pre-commit.sh .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  ```
  The hook runs `yarn lint:locales` on every commit; fix any reported issues and
  re-run `git commit`.

### Favicons pipeline

- Maintain the master artwork in `src/assets/SVG/faviconMaster.svg`. Tag any
  shapes you want exported as the Safari mask with `data-mask="true"` and the
  Windows tile foreground with `data-tile-fg="true"`. The generator will throw
  if those annotations are missing so we catch regressions early.
- Run `yarn favicons` whenever the master SVG or the favicon tokens change. The
  script resets `public/favicons/`, regenerates every hashed asset, and emits a
  TypeScript manifest under `src/data/generated/favicons.manifest.gen.ts`.
- During development the generator also writes formatted `.gen.svg` artifacts
  for the tagged layers so the favicons debug page can preview them—they live in
  `public/favicons/` and are replaced on every run. The directory is fully
  ignored by git, so only the source SVG lands in version control.
