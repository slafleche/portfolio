# Agent Instructions for `ai/epics`

This directory contains epic-level context files that guide work across the
repo. These files are the primary input/output for role "hats" such as
`#navigator`, `#architect`, `#projectManager`, and `#coder`.

## Structure and naming

- Must: Place each epic under its own folder:
  - Either directly under `ai/epics/<epic-id>/`, or
  - Under a grouping subfolder such as `ai/epics/blockedUpgrades/<epic-id>/` for
    blocked upgrade epics.
- Must: Prefix epic files with the epic id and use the following conventions:
  - `<epic-id>_primer.md` — problem, goals, constraints, success criteria.
  - `<epic-id>_implementation.md` — high-level approach and architecture notes.
  - `<epic-id>_plan.md` — checklist of tasks/slices and their notes.
  - Optional: `<epic-id>_notes.md` — scratchpad or running notes for this epic.
- May: When the user asks for a shorthand filename inside an epic folder (for
  example, "spec.md" or "primer.md"), interpret it as `<epic-id>_spec.md`,
  `<epic-id>_primer.md`, etc., so long as this keeps the prefix rule intact. If
  there is any ambiguity about which epic id or suffix to use, ask the user to
  confirm before creating or renaming files.

## Tasks and checklists

- Must: Represent actionable tasks in epic TODO/backlog files (for example,
  `form.TODO.md`, `TODO.bugs.md`, `*.backlog.md`) as Markdown task items using
  `- [ ]` / `- [x]` rather than plain bullets.
- May: Use plain `-` bullets for explanatory or contextual notes that are not
  themselves tasks.

## Stories

- Should: Keep short, single-paragraph user stories inline in
  `<epic-id>_primer.md` under a clearly labeled heading (for example, "User
  stories").
- Should: When a story grows beyond a small paragraph or needs detailed
  flows/acceptance criteria, place it in a dedicated stories file under
  `ai/epics/<epic-id>/stories/` using the pattern
  `<epic-id>.story.<story-name>.md`.
- Must: Avoid duplicating long stories between the primer and stories files;
  when a story has its own file, reference it briefly from the primer instead of
  copying the full text.

## Success criteria

- Should: Keep simple, short success criteria as bullet points in
  `<epic-id>_primer.md` under a "Success criteria" (or similar) heading.
- Should: When success criteria become complex (for example, per-component
  checklists or multiple categories), move the detailed versions into separate
  files under `ai/epics/<epic-id>/success/` using the pattern
  `success/<epic-id>.<success-name>.success.md`.
- Must: Treat the detailed success files as canonical for their scope; the
  primer should reference them briefly instead of duplicating full criteria
  text.

## Role usage (hats)

- Should: Use the epics files as IO for roles:
  - `#navigator` or `#n` works primarily in `<epic-id>_primer.md`.
  - `#architect` or `#a` works primarily in `<epic-id>_implementation.md`.
  - `#projectManager` or `#pm` works primarily in `<epic-id>_plan.md`.
  - `#coder` or `#c` reads all of the above before editing code or tests.
- Should: See `roles/README.md` and any `roles/*.md` documents for detailed
  expectations per role.

## Exploration vs current state (`epics-layer`)

- Must: When shaping or rethinking behaviour under an epic, treat existing code, tests, and docs as describing the **current** implementation, not the proposed design.
- May: During the planning/spec phase of an epic, let the desired behaviour diverge from the current implementation; once the spec is settled, explicitly call out any mismatches so implementation and tests can be updated deliberately.
