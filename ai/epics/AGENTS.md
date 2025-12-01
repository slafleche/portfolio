# Agent Instructions for `ai/epics`

This directory contains epic-level context files that guide work across the repo. These files are the primary input/output for role "hats" such as `#navigator`, `#architect`, `#projectManager`, and `#coder`.

## Structure and naming

- Must: Place each epic under its own folder: `ai/epics/<epic-id>/`.
- Must: Prefix epic files with the epic id and use the following conventions:
  - `<epic-id>_primer.md` — problem, goals, constraints, success criteria.
  - `<epic-id>_implementation.md` — high-level approach and architecture notes.
  - `<epic-id>_plan.md` or `TODO.<epic-id>.md` — checklist of tasks/slices and their notes.
  - Optional: `<epic-id>_notes.md` — scratchpad or running notes for this epic.

## Role usage (hats)

- Should: Use the epics files as IO for roles:
  - `#navigator` works primarily in `<epic-id>_primer.md`.
  - `#architect` works primarily in `<epic-id>_implementation.md`.
  - `#pm` works primarily in `<epic-id>_plan.md` / `TODO.<epic-id>.md`.
  - `#coder` reads all of the above before editing code or tests.
- Should: See `ai/epics/README.md` and any `roles/*.md` documents for detailed expectations per role.
