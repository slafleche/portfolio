# `src/lib/locales` — user-facing copy and localization

Manages user-facing copy, localization helpers, and rich-text processing.
See the `localization` skill for the full pattern and the `wizard` skill for
the copy approval flow.

- Centralize all user-visible strings and localization logic here.
- Use established patterns: abbreviation shortcodes (`[abbr:TERM]`),
  rich-text types for structured content, `[split]` line breaks in
  SVG-headed strings.
- Don't hand-edit generated locale outputs under
  `src/lib/locales/generated/`. Regenerate via `yarn locales` (lint →
  markdown → publish).
- Keep locale utilities framework-agnostic. No direct React dependencies.
- New shortcodes (e.g. `abbr-*` entries) must be fully defined before use —
  builds fail on missing definitions.
- When changing locale rules or schemas, update related scripts and ensure
  linting/locale checks still pass.
- Keep `yarn lint:locales` passing. The optional pre-commit hook runs this
  on every commit (see `README.md`).
- When introducing or changing user-visible text, follow the `wizard` skill
  copy flow (agree on text → decide placement/format → add keys and wire).
  Don't hard-code new strings or call translators directly in components or
  tests.
