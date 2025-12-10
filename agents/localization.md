# Module: localization

## Purpose

Centralize user-facing copy and localization rules so components remain
copy-agnostic.

## Key points

- Keep all user-visible strings and localization logic under `src/lib/locales`
  rather than inlining copy in components.
- Use established patterns such as abbreviation shortcodes (`[abbr:TERM]`) and
  rich-text types for structured content.
- Do not hand-edit generated locale outputs under `src/lib/locales/generated/`;
  use the appropriate scripts or pipelines instead.
- Keep locale utilities framework-agnostic; they should not depend directly on
  React components.
- Ensure new shortcodes (for example, `abbr-*` entries) are fully defined before
  use so builds do not fail on missing definitions.
- Keep `yarn lint:locales` passing; the optional pre-commit hook runs this check
  on every commit (see `README.md` for setup).
