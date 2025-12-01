# Agent Instructions for `portfolio`

This file is **only for automated agents** (Codex CLI / GPT, etc.). It does
**not** prescribe a workflow for humans.

## Scope

- Applies to the entire repository unless a more specific `AGENTS.md` exists in
  a subdirectory.

## Git and staging (`git-staging`)

- Must: Do **not** run `git add`, `git commit`, `git reset`, or other
  Git-mutating commands unless the user explicitly asks.
- Must: Treat staged changes as a protected snapshot; do not modify staged files
  without explicit confirmation.

## Workflow and TODOs (`workflow-and-todos`)

- Must: Follow the “talk → clarify → TODO → go” cadence for non-trivial tasks.
- Must: Use `TODO.*.md` files (Primer, checklist, then `### Step N — title`
  sections) for real tasks, primarily under `ai/epics/` (per-epic plans) and
  `ai/backlog/` (cross-cutting backlogs); a brief inline plan in chat is fine
  for tiny edits, and root-level TODOs should be rare/explicit.
- Must: Before coding, pause to check that tokens are consumed directly, helpers
  are in use, and values are not re-aliased without a real transformation.
- Should: For step-by-step, list-based work on a known list of items, follow
  the wizard flow described in `agents/wizard.md` (one item at a time with
  explicit approval before moving on).
- Must: For non-trivial work that introduces new structures (types/interfaces,
  data shapes, locale key groups, helpers/config), first propose the primary
  building blocks and wait for explicit user approval before using them in
  components, APIs, or flows.
- May: When extending an already approved structure with more of the same (for
  example, adding another locale string to an existing key group or another
  field to an established type), follow the existing pattern without re-
  approving the building blocks.

## Approval-required actions

- Must: Ask for confirmation before invasive refactors, API changes, or
  cross-cutting style rewrites.
- Must: Get explicit confirmation before deleting any file or effectively
  wiping its contents (for example, replacing a real doc with a stub),
  especially `.md`, config, or rules files.
- Must: Do not introduce or convert files into “redirects” or barrels (for
  example, pointer TODOs, stub docs that only link elsewhere, or index/modules
  that only re-export others) unless the user explicitly approves using a
  redirect/barrel for that specific case in the current chat.

## Architecture and layers (`architecture-layers`)

- Must: Respect the token → helper → module → style layering encoded in
  `rules.yaml`; fix violations instead of working around them.

## Generated vs source files (`generated-artifacts`, `data-generated`, `locales-generated`)

- Must: Treat any `*.gen.*` file and contents of `/generated/` directories as
  script-generated outputs; do not hand-edit them.
- Should: Use the relevant scripts in `package.json` (for example,
  `yarn locales:markdown`, `yarn favicons`, or `yarn fonts:urls`) to regenerate
  these artifacts when behavior or inputs change, instead of editing outputs
  directly.

## Communication and guardrails (`communication`, `debug-sandboxes`, `architecture-guardrails-and-tooling`)

- Should: Capture important decisions in `README.md` or `TODO.*.md` so future
  work has context, and surface unrelated lint/type errors without fixing them
  unless asked.
- Must: When a user message (non-code text) contains a `?`, reply using
  text-only responses—no code blocks or other non-text output.
- Must: When AGENTS, user instructions, or existing code seem to conflict, call
  out the mismatch and ask which to follow before proceeding.
- Must: When there are multiple reasonable paths that would change behaviour or
  structure (for example, different refactor shapes, epic choices, or file
  layouts), stop and ask the user to choose instead of silently prioritising
  one based on internal rules.
- Must: When introducing a new pattern that is not clearly described in an
  existing epic or module file (for example, a new helper style, file layout,
  or locale key family), propose it first and wait for explicit user approval
  before implementing.
- Must: Treat `rules.yaml` and this `AGENTS.md` as canonical for architecture
  and agent behavior; do not weaken or bypass existing lint rules, layering
  constraints, or pre-commit checks unless the user explicitly requests it and
  understands the trade-offs.
- Should: When editing `rules.yaml`, keep related scripts under `scripts/` in
  sync and run `yarn lint` to ensure configs still load.
- Should: When the user activates a role tag (for example, `#navigator` / `#n`,
  `#architect` / `#a`, `#projectManager`/`#pm`, `#coder`/`#c`), consult
  `roles/README.md` and the corresponding file under `roles/` and follow that
  role’s behavior for the chat in addition to these rules.
