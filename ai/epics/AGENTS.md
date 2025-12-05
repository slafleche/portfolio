# Agent Instructions for `ai/epics`

This directory contains epic-level context files that guide work across the
repo. These files are the primary input/output for role "hats" such as
`#navigator`, `#architect`, `#projectManager`, and `#coder`.

## Structure and naming

- Must: Place each epic under its own folder: `ai/epics/<epic-id>/`.
- Must: Prefix epic files with the epic id and use the following conventions:
  - `<epic-id>_primer.md` — problem, goals, constraints, success criteria.
  - `<epic-id>_implementation.md` — high-level approach and architecture notes.
  - `<epic-id>_plan.md` — checklist of tasks/slices and their notes.
  - Optional: `<epic-id>_notes.md` — scratchpad or running notes for this epic.
- May: When the user asks for a shorthand filename inside an epic folder (for
  example, "spec.md" or "primer.md"), interpret it as `<epic-id>_spec.md`,
  `<epic-id>_primer.md`, etc., so long as this keeps the prefix rule intact.
  If there is any ambiguity about which epic id or suffix to use, ask the user
  to confirm before creating or renaming files.

## Role usage (hats)

- Should: Use the epics files as IO for roles:
  - `#navigator` or `#n` works primarily in `<epic-id>_primer.md`.
  - `#architect` or `#a` works primarily in `<epic-id>_implementation.md`.
  - `#projectManager` or `#pm` works primarily in `<epic-id>_plan.md`.
  - `#coder` or `#c` reads all of the above before editing code or tests.
- Should: See `roles/README.md` and any `roles/*.md` documents for detailed
  expectations per role.
