# Portfolio — Claude project instructions

These are the project-level rules for working in this repo. They apply on top of
`~/.claude/CLAUDE.md`. Procedural how-tos live under `.claude/skills/`.
Architectural lint rules live in `rules.yaml` at the root (programmatically
consumed by `eslint/rules.mjs` and `scripts/checkLintRules.mjs` — do not move
or rename it).

## Repo landmarks

- `app/` — Next.js App Router routes (pages, layouts, API routes, debug previews).
- `src/` — components, modules, styles, locales, server utilities.
- `src/data/generated/`, `src/lib/locales/generated/`, `src/assets/SVG/generated/`,
  `src/styles/fontFaces.*.css.ts`, `public/favicons/`, `public/styles/fontFaces.*.gen.css`
  — script-generated outputs (see Generated artifacts below).
- `scripts/` — TS/JS scripts for generation, lint checks, e2e orchestration.
- `eslint/` — custom ESLint plugin enforcing `rules.yaml`.
- `rules.yaml` — canonical architecture layer rules (do not edit without bumping
  the `updated` field and running `yarn lint`).
- `tests/`, `vitest.config.ts`, `playwright.config.ts` — vitest + Playwright.
- `.cloudflare/` — Cloudflare Worker for CORS + R2 asset serving
  (`cors_worker.js`, `wrangler.toml`, docs in `.cloudflare/readme.md`). Include
  this in scope when debugging prod-only issues (headers/CSP/CORS/caching).
- `.github/workflows/` — CI; `.github/workflows/ci.yml` runs `yarn locales`,
  `yarn lint:cycles`, and `yarn ci` per branch rules.
- `ai/epics/<epic-id>/` — per-epic planning docs
  (`<epic-id>_primer.md`, `<epic-id>_implementation.md`, `<epic-id>_plan.md`).
  The role skills (navigator, architect, project-manager, coder) read and write
  these.

## Architecture and layers

Token → helper → module → style. This layering is encoded in `rules.yaml` and
enforced by ESLint + `scripts/checkLintRules.mjs`. Fix violations instead of
working around them.

- **Tokens** (`src/styles/tokens/`, `src/data/tokens/`): pure, structured,
  typed data (measurements, colors, fonts). No `.css()`, no CSS strings, no
  imports from `app/`, `modules/`, or `styles/`. Prefer grouped pluralized
  bundles (`paddings`, `borders`, `boxShadows`, `fonts`). Do not coerce
  measurements to numbers/strings inside tokens — coercion happens at
  adapter/emission boundaries via sanctioned css-calipers APIs.
- **Helpers** (`src/styles/helpers/`): reusable styling logic and measurement
  math. Import tokens. Expose named helpers (`paddings`, `margins`, `borders`,
  `boxShadows`, `backdropFilters`). Do not call `.css()` or emit CSS directly.
  Keep math in measurement space. Guarded properties (`boxShadow`,
  `backdropFilter`) belong only in their dedicated helper implementations as
  allowed by `rules.yaml`.
- **Modules** (`src/modules/`): glue tokens + helpers together for features.
  Stay CSS-free.
- **Styles** (`src/styles/**/*.css.ts`): the only place that emits CSS and
  calls `.css()`. Use helpers for layout/visual properties (paddings, margins,
  borders, shadows, backdrop filters, gradients, typography) rather than
  manual shorthands. Respect import constraints from `rules.yaml` (no
  importing app/modules from styles). Component-level styles under
  `src/styles/components` define selectors and visual states — no business
  logic, no React concerns. Prefer `&`-scoped selectors; use `globalStyle` or
  adjust markup if cross-class targeting is unavoidable.
- For circular or pill-shaped corners, use percentage-based radii (e.g. 50%)
  via measurement helpers, not oversized absolute radii (e.g. `m(9999)`).

## Components

- Implement accessible, focused UI under `src/components` using
  tokens/helpers/modules. No ad-hoc styling systems.
- Keep components small. Push complex transformations into `src/modules/` or
  helper functions.
- Don't hand-write guarded properties (padding, margin, border, background,
  box-shadow, backdrop-filter) when a helper exists — route them through
  shared helpers.

## Generated artifacts

Treat any `*.gen.*` file and contents of `/generated/` directories as
script-generated outputs. Do not hand-edit. Regenerate via scripts.

Generated paths:
- `src/data/generated/` (e.g. `favicons/manifest.favicons.gen.ts`,
  `fonts/googleFonts.gen.ts`, `_staging/` and `release/` manifests for
  images/videos/fonts, `minimalFontText.gen.ts`)
- `src/lib/locales/generated/` — regenerate via `yarn locales`
- `src/assets/SVG/generated/` — regenerate via `yarn build:hero-svg`
  (requires `yarn dev` running on port 3000)
- `src/styles/fontFaces.*.css.ts`, `public/styles/fontFaces.*.gen.css`
- `public/favicons/` — regenerate via favicon scripts

When behavior needs to change, update source inputs or generator scripts
instead of patching generated outputs.

## Debug sandboxes

Debug previews under `app/[LOCALE]/debug/*` and any sandbox/experimental
components are disposable. Keep styling and logic self-contained so files can
be deleted once a feature stabilizes. Don't share CSS or helpers from debug
sandboxes into production modules or styles. Label debug-only components
clearly.

## Localization

All user-visible strings live under `src/lib/locales/`. Don't inline copy in
components. Use established patterns (abbreviation shortcodes `[abbr:TERM]`,
rich-text types, `[split]` for SVG heading line breaks). New shortcodes (e.g.
`abbr-*` entries) must be fully defined before use — builds fail on missing
definitions. Keep locale utilities framework-agnostic; no direct React
dependencies in `src/lib/locales/`.

Don't hand-edit `src/lib/locales/generated/`; use `yarn locales` (which runs
lint → markdown → publish steps).

When introducing or changing user-visible text, see the `wizard` skill
(`.claude/skills/wizard/SKILL.md`) — agree on copy in plain language first,
decide placement (section builder under `src/lib/locales/sections/`, plain
string vs markdown vs shortcode), then add keys and thread through component
props. Don't hard-code new strings or call translators directly in components
or tests.

If you see a "missing markdown copy" warning for a key, add the `.md` file
under `src/lib/locales/translations/markdown/` and wire it via
`markdownRefs('<key>')` in each locale's `*.data.ts`.

Keep `yarn lint:locales` passing; the optional pre-commit hook runs this on
every commit (see `README.md`).

## Contact forms

UI under `src/components/contact`. Delegate validation and submission to
modules and `src/server/` utilities. Wire UI state to the existing
`messageCentre` / `messageCentreDebugScenario` mechanisms — don't introduce
parallel flows. Don't bypass rate limiting, Turnstile, or other guardrails in
`src/server/`. Keep copy in `src/lib/locales/`. Preserve accessibility (screen
reader, keyboard, focus management).

## Scripts and tooling

Scripts under `scripts/` are the source of truth for generation and
verification. Prefer idempotent, repeatable scripts that re-run safely locally
and in CI. When architecture/rules change (e.g. updates to `rules.yaml`),
update any dependent scripts. Don't add app-specific business logic to generic
helper scripts.

## Linting and pre-commit

- Run `yarn lint` after non-trivial changes to app code. Either run it
  directly or explicitly ask the user to.
- Run `yarn lint:rules` after any change to style-layer files under
  `src/styles/` (including `*.css.ts`).
- When editing `rules.yaml`, bump the `updated` field and run `yarn lint` so
  the configs still load.
- Treat `rules.yaml` and this `CLAUDE.md` as canonical for architecture and
  agent behavior. Don't weaken or bypass existing lint rules, layering
  constraints, or pre-commit checks unless the user explicitly requests it and
  understands the trade-offs.

## Testing discipline

- Prefer real failing tests over disabled ones. Don't use `it.skip`,
  `describe.skip`, `test.skip`, or `.todo` to park incomplete behavior —
  capture intended behavior as assertions that fail until the feature is
  correctly implemented.
- Don't "cheat" by updating expectations to match a known-bad result.
  Expectations describe desired behavior, not the current bug.
- Keep guards inside tests minimal. Avoid early returns or defensive branches
  that allow tests to pass without exercising the code under test (e.g.
  returning early after an element query instead of letting the test fail
  when wiring is wrong).

## Workflow and approvals

- Separate WHAT (planning) from DO (execution). During WHAT, don't change
  files. During DO, follow the agreed spec exactly and ask when anything is
  ambiguous or blocked.
- For non-trivial work that introduces new structures (types/interfaces, data
  shapes, locale key groups, helpers/config), first propose the primary
  building blocks during WHAT and wait for explicit user approval before using
  them in components, APIs, or flows.
- When extending an already-approved structure with more of the same (e.g.
  adding another locale string to an existing key group), follow the existing
  pattern without re-approving.
- For non-trivial work, start with the elementary pieces first (TypeScript
  types/interfaces, data shapes, small helpers/config) and only then wire
  components, APIs, or flows.
- Before coding in DO mode, quick-check that tokens are consumed directly,
  helpers are in use, and values are not re-aliased without a real
  transformation.
- For step-by-step list-based work, follow the `wizard` skill only when the
  user requests item-by-item approvals.

### Approval-required actions

- Ask before invasive refactors, API changes, or cross-cutting style
  rewrites.
- If you plan to edit things out of scope of the request, ask first and
  explain your reasoning.
- Get explicit confirmation before deleting any file or effectively wiping
  its contents (e.g. replacing a real doc with a stub), especially `.md`,
  config, or rules files.
- Don't introduce or convert files into "redirects" or barrels (pointer
  TODOs, stub docs that only link elsewhere, index/modules that only
  re-export others) unless the user explicitly approves for that specific
  case in the current chat.

## File freshness and edits

- Before editing any existing non-generated file that's been mentioned in
  chat or is currently active in the IDE, re-read its current contents in
  this session. Base changes only on the latest version, not an earlier
  in-memory snapshot.
- Always re-read the full file before editing it, even if you believe you
  just saw it.
- Before answering questions about code behavior or structure, re-read the
  relevant file(s) and base the response on that latest content, not memory.
- Prefer small, targeted patches over whole-file rewrites unless the user
  explicitly asks for a larger refactor.
- Before editing any markdown file (`*.md`), re-read the full file contents
  in this chat session (even if you saw it earlier) and treat that as the
  single source of truth for your edits.

## Git and staging

The user's global `~/.claude/CLAUDE.md` already covers trigger-word-only git
mutations. Additional repo-specific points:
- Treat staged changes as a protected snapshot; the user keeps staged changes
  as a backup. Don't modify staged files unless the user confirms it's OK
  for that specific file.
- **No git commands without explicit invocation.** Don't run any `git`
  subcommand (including read-only ones like `git status`, `git diff`,
  `git log`) unless the user's most recent message explicitly says
  "run git <subcommand>" (e.g. "run git status", "run git push"). Phrases like
  "go", "do it", "yes", "go ahead", "fix it", "ship it" never authorize a git
  command. This overrides the global rule's allowance for read-only git.
- **Never run `yarn sync:branches` (or `scripts/syncBranches.sh`).** This
  script fast-forwards `staging` and `release` to `main` and pushes both. It
  must be invoked by the user only. Don't suggest running it on the user's
  behalf, don't pipe it through any other tool, and don't bypass this rule
  even if the user says "go" or "do it" — the user must run it themselves.

## Communication

- When file paths are part of a decision or next action, include the full
  path in the visible text — don't hide it behind a generic "link" label.
- Any statement of desired behavior ("should", "expected", "wrong") implies
  corrective intent. Output the fix (minimal diff or corrected draft). Don't
  restate existing behavior unless explicitly asked for diagnostics.
- When a user implies a bug ("why is...", "X doesn't do Y"), inspect the
  relevant code first and respond with the fix, not a summary or guessed
  explanation.
- When the user asks to explain or diagnose, don't modify code unless they
  explicitly ask for a fix.
- Don't provide summaries unless explicitly asked; default to code drafts.
- When the user asks for code, ask any clarifying questions first, then
  respond with code drafts only (no summary or explanation).
- When providing draft fixes, respond with code blocks instead of text
  summaries.
- When providing a code draft, finish with a note saying it is a draft.
- When a user message (non-code text) contains a `?`, reply with text only —
  no code blocks or other non-text output. Exception: "what's wrong" or
  "why isn't" questions get a code-only draft.
- If the user says "fix:", apply changes directly instead of providing a
  draft.
- When `CLAUDE.md`, user instructions, or existing code seem to conflict,
  call out the mismatch and ask which to follow before proceeding.
- When there are multiple reasonable paths that would change behavior or
  structure (different refactor shapes, epic choices, file layouts), stop
  and ask the user to choose instead of silently prioritizing one.
- When introducing a new pattern not clearly described in an existing epic
  or rule (a new helper style, file layout, locale key family), propose it
  first and wait for explicit user approval before implementing.
- When the user deletes or asks to delete a section, heading, or list item
  in a markdown file, don't reintroduce that content (or a similar
  replacement) in later edits unless they clearly request it again in the
  current chat. If you believe a removed markdown section is still useful
  (e.g. a checklist), propose the new structure in chat and wait for
  explicit approval instead of silently restoring it.

### User shortcuts

- `#tldr` — rework the reply to show only what's missing or needs editing.
  Cut summary info and confirmations of what was already done.
- `#tests:e2e` — inspect `test-results/` and use the most recent run to
  propose code fixes only. Don't edit files yet and don't provide a summary.

## Roles

The user may activate one of four collaboration "hats" via tags. When a tag is
active, treat that role as active for the chat until the user explicitly
switches hats (or resets via `#none`). Each role is implemented as a skill
under `.claude/skills/`:

- `#navigator` / `#n` — clarify WHAT and WHY. Reads/writes
  `ai/epics/<epic-id>/<epic-id>_primer.md`.
- `#architect` / `#a` — design HOW (approach, data shapes, interfaces,
  risks). Reads primer; writes `<epic-id>_implementation.md`.
- `#projectManager` / `#pm` — slice and order work. Reads primer +
  implementation; writes `<epic-id>_plan.md` (and cross-cutting `TODO.*.md`).
- `#coder` / `#c` — implement planned slices in code/tests. Reads
  `CLAUDE.md`, primer, implementation, and plan before editing.

Roles never override architecture rules in this file or `rules.yaml`. Roles
never switch themselves — they surface gaps or questions and let the user
choose. When a role discovers missing or unclear context (no primer, fuzzy
tasks, conflicts), it tells the user explicitly and suggests updating the
relevant epic files.
