## Fast iteration, low risk

The site is built with modern tools that let me ship changes quickly while
catching bugs before they reach users. Automated visual testing means UI updates
can be reviewed and deployed confidently, without manual QA cycles.

I also keep styling inputs typed (instead of stringly-typed CSS), using CSS
Calipers published on
<span data-white-space="no-wrap">[element:NPMWordmark|en].</span> That means
unit mixups and invalid values get caught at authoring time, and the output
remains plain, debuggable CSS.

- unit testing
- storybook + playwright screen shots

## Maintainable by design

The codebase uses consistent patterns enforced by automated checks, so changes
stay predictable and reviewable. New features don’t break old ones, and
technical debt gets caught early rather than accumulating over time.

Some examples of the guardrails I built into this repo:

- dependency boundary checks (keep layers clean and changes scoped)
- custom style rules (prevent "CSS drift" and keep UI consistent)
- localization content validation (missing keys, formatting rules)
- secret scanning and runtime config checks (avoid accidental leaks)

Unit and integration tests (Vitest + Testing Library) cover core logic and key
UI behavior, so refactors can ship with confidence.

## Reliable delivery

Assets, content, and localization are generated through repeatable scripts; no
manual steps means fewer mistakes and faster releases. Everything from favicons
to CDN content updates automatically with clear audit trails.

- favicons
- home title svg
- custom font hosting
- video/image
- image generation (code hint)
- svg optimization
- Site map
- locales (verify no duplicate IDs, verify no missing keys in other locale,
  parse MD files, you get actual JS error if location is missing or bad key
  instead of finding out in production)
- eslint/ts/prettier
- verify no circular dependency
- lint secrets
-

CDN has versioning as well as site (staging/prod), hash for easily skippable

## AI for leverage

I use AI to accelerate routine work (documentation, test scaffolding,
consistency checks) while keeping quality standards human-owned. AI output gets
validated the same way hand-written code does: through types, tests, and
automated reviews.
