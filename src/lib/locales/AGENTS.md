# Agent Instructions for `src/lib/locales`

This directory manages user-facing copy, localization helpers, and rich-text processing.

## Responsibilities (`localization`)

- Must: Centralize all user-visible strings and localization logic here.
- Must: Use established patterns such as abbreviation shortcodes (`[abbr:TERM]`) and rich-text types for structured content.

## Constraints (`localization`)

- Must: Do not hand-edit generated locale outputs under `src/lib/locales/generated/`; use the appropriate scripts or pipelines instead.
- Must: Keep locale utilities framework-agnostic; they should not depend directly on React components.

## Shortcodes and guardrails (`localization`)

- Must: Ensure new shortcodes (for example, `abbr-*` entries) are fully defined before use so builds do not fail on missing definitions.
- Must: When changing locale rules or schemas, update any related scripts and ensure linting/locale checks still pass.
- Must: Keep `yarn lint:locales` passing; the optional pre-commit hook runs this check on every commit (see `README.md` for setup).
- Must: When introducing or changing user-visible text, follow the copy wizard flow described in `agents/wizard.md` (text → placement/format → keys/wiring) and avoid hard-coding new strings or calling translators directly in components or tests.
