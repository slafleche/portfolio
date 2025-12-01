# Agent Instructions for `portfolio`

This file is **only for automated agents** (Codex CLI / GPT, etc.). It does **not** prescribe a workflow for humans.

## Scope

- Applies to the entire repository unless a more specific `AGENTS.md` exists in a subdirectory.

## Git and staging (`git-staging`)

- Must: Do **not** run `git add`, `git commit`, `git reset`, or other Git-mutating commands unless the user explicitly asks.
- Must: Treat staged changes as a protected snapshot; do not modify staged files without explicit confirmation.

## Workflow and TODOs (`workflow-and-todos`)

- Must: Follow the “talk → clarify → TODO → go” cadence for non-trivial tasks.
- Must: Use `TODO.*.md` files (Primer, checklist, then `### Step N — title` sections) for real tasks; a brief inline plan in chat is fine for tiny edits.
- Must: Before coding, pause to check that tokens are consumed directly, helpers are in use, and values are not re-aliased without a real transformation.

## Architecture and layers (`architecture-layers`)

- Must: Respect the token → helper → module → style layering encoded in `rules.yaml`; fix violations instead of working around them.

## Generated vs source files (`generated-artifacts`, `data-generated`, `locales-generated`)

- Must: Treat any `*.gen.*` file and contents of `/generated/` directories as script-generated outputs; do not hand-edit them.
- Should: Use the relevant scripts in `package.json` (for example, `yarn locales:markdown`, `yarn favicons`, or `yarn fonts:urls`) to regenerate these artifacts when behavior or inputs change, instead of editing outputs directly.

## Communication and guardrails (`communication`, `debug-sandboxes`, `architecture-guardrails-and-tooling`)

- Must: Ask for confirmation before invasive refactors, API changes, or cross-cutting style rewrites.
- Should: Capture important decisions in `README.md` or `TODO.*.md` so future work has context, and surface unrelated lint/type errors without fixing them unless asked.
- Must: When a user message (non-code text) contains a `?`, reply using text-only responses—no code blocks or other non-text output.
- Must: When AGENTS, user instructions, or existing code seem to conflict, call out the mismatch and ask which to follow before proceeding.
- Must: Treat `rules.yaml` and this `AGENTS.md` as canonical for architecture and agent behavior; do not weaken or bypass existing lint rules, layering constraints, or pre-commit checks unless the user explicitly requests it and understands the trade-offs.
- Should: When editing `rules.yaml`, keep related scripts under `scripts/` in sync and run `yarn lint` to ensure configs still load.
