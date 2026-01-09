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
- User preference: Staged files may be modified without extra confirmation; the
  user keeps staged changes as a backup unless they say otherwise.

## Workflow and TODOs (`workflow-and-todos`)

- Must: Keep alignment through collaborative, iterative planning with quick
  check-ins and explicit assumptions; do not force a fixed cadence.
- Should: Use “talk → clarify → TODO → go” only when it helps the user, not as a
  required sequence.
- Must: Separate WHAT (planning) from DO (execution). During WHAT, do not change
  files; during DO, follow the agreed spec exactly and ask when anything is
  ambiguous or blocked.
- Should: During WHAT, keep file investigation lightweight and announce deeper
  dives before doing them.
- Should: Use structured plan/backlog files when explicitly requested or when
  both the user and agent agree it is needed: per-epic plans under `ai/epics/`
  as `<epic-id>_primer.md`, `<epic-id>_implementation.md`, and
  `<epic-id>_plan.md`, and cross-cutting backlogs under `ai/backlog/` as
  `TODO.*.md` or `*.backlog.md`; a brief inline plan in chat is fine for tiny
  edits, and root-level TODOs should be rare/explicit.
- Must: If the user asks for a plan/backlog file, follow the required structure
  above.
- Must: Before coding in DO mode, do a quick check that tokens are consumed
  directly, helpers are in use, and values are not re-aliased without a real
  transformation.
- Should: For step-by-step, list-based work on a known list of items, follow the
  wizard flow described in `agents/wizard.md` only when the user requests
  item-by-item approvals.
- Must: For non-trivial work that introduces new structures (types/interfaces,
  data shapes, locale key groups, helpers/config), first propose the primary
  building blocks during WHAT and wait for explicit user approval before using
  them in components, APIs, or flows during DO.
- May: When extending an already approved structure with more of the same (for
  example, adding another locale string to an existing key group or another
  field to an established type), follow the existing pattern without re-
  approving the building blocks.

## File freshness and edits (`file-freshness`)

- Must: Before editing any existing non-generated file that has been mentioned
  in this chat or is currently active in the IDE, re-read its current contents
  in this session and base changes only on that latest version, not on any
  earlier in-memory snapshot.
- Must: Always re-read the full file before editing it, even if you believe you
  just saw it moments ago.
- Must: Before answering questions about code behavior or structure, re-read
  the relevant file(s) in this session and base the response on that latest
  content, not memory.
- Should: Prefer small, targeted patches over whole-file rewrites unless the
  user explicitly asks for a larger refactor or restructure.
- Must: Before editing any markdown file (`*.md`), re-read the full file
  contents in this chat session (even if you saw it earlier) and treat that as
  the single source of truth for your edits.

## Approval-required actions

- Must: Ask for confirmation before invasive refactors, API changes, or
  cross-cutting style rewrites.
- Must: Get explicit confirmation before deleting any file or effectively wiping
  its contents (for example, replacing a real doc with a stub), especially
  `.md`, config, or rules files.
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
- Must: Any statement of desired behavior ("should", "expected", "wrong")
  implies corrective intent. Output the fix (minimal diff or corrected draft).
  Never restate existing behavior unless explicitly asked for diagnostics.
- Must: When a user implies a bug (for example, "why is..." or "X doesn't do Y"),
  inspect the relevant code first and respond with the fix, not a summary or
  guessed explanation.
- Must: When the user asks to explain or diagnose, do not modify code unless
  they explicitly ask for a fix; provide analysis only.
- Must: Do not provide summaries unless the user explicitly asks for one.
- Must: When a user message (non-code text) contains a `?`, reply using
  text-only responses—no code blocks or other non-text output.
- Must: When AGENTS, user instructions, or existing code seem to conflict, call
  out the mismatch and ask which to follow before proceeding.
- Must: When there are multiple reasonable paths that would change behaviour or
  structure (for example, different refactor shapes, epic choices, or file
  layouts), stop and ask the user to choose instead of silently prioritising one
  based on internal rules.
- Must: When introducing a new pattern that is not clearly described in an
  existing epic or module file (for example, a new helper style, file layout, or
  locale key family), propose it first and wait for explicit user approval
  before implementing.
- Must: Treat `rules.yaml` and this `AGENTS.md` as canonical for architecture
  and agent behavior; do not weaken or bypass existing lint rules, layering
  constraints, or pre-commit checks unless the user explicitly requests it and
  understands the trade-offs.
- Must: For circular or pill-shaped corners, prefer percentage-based border
  radii (for example, 50%) via measurement helpers instead of oversized absolute
  radii (for example, m(9999)).
- Should: When editing `rules.yaml`, keep related scripts under `scripts/` in
  sync and run `yarn lint` to ensure configs still load.
- Should: When the user activates a role tag (for example, `#navigator` / `#n`,
  `#architect` / `#a`, `#projectManager`/`#pm`, `#coder`/`#c`), consult
  `roles/README.md` and the corresponding file under `roles/` and follow that
  role’s behavior for the chat in addition to these rules. When a role tag is
  active, treat that role as active for the chat until the user explicitly
  switches hats. Can be reset to nothing with `#none`
- Should: When the user calls `#tldr`it means: rework reply to only show what's
  missing or needs editing. Cut out all summary info, or confirmations of what
  was already done.
- Must: When the user deletes or asks to delete a section, heading, or list item
  in a markdown file, do not reintroduce that content (or a similar replacement)
  in later edits unless the user clearly requests it again in the current chat.
- Should: If you believe a removed markdown section is still useful (for
  example, a checklist or plan), propose the new structure in chat and wait for
  explicit approval instead of silently restoring it.

## Linting and guardrails (`linting`)

- Must: When you make non-trivial changes to application code, ensure
  `yarn lint` has been run before considering the work complete; the agent may
  either run `yarn lint` directly or explicitly ask the user to run it.
- Must: When you touch style-layer files under `src/styles` (including
  `*.css.ts`), run `yarn lint:rules` after your changes to ensure architecture
  guardrails still hold.

## Testing discipline (`testing`)

- Must: Prefer real failing tests over disabled ones; do not use constructs like
  `it.skip`, `describe.skip`, `test.skip`, or `.todo` to park incomplete
  behaviour—capture the intended behaviour as assertions that fail until the
  feature is correctly implemented.
- Must: Do not “cheat” by updating expectations just to match a known-bad
  implementation result; expectations should describe the desired behaviour, not
  the current bug.
- Should: Keep guards inside tests minimal; avoid early returns or defensive
  branches that can allow tests to pass without actually exercising the code
  under test (for example, returning early after an element query instead of
  letting the test fail when the wiring is wrong).
