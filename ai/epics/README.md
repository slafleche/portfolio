# Epics and Roles Overview

This directory holds **epic-level context** for work in this repo. It is
designed to be used with the role "hats" (`#navigator` or `#n`, `#architect` or
`#a`, `#projectManager` or `#pm`, `#coder` or `#c`) so that different kinds of
work have clear inputs and outputs.

## Folder structure

- Each epic lives under its own folder:
  - `ai/epics/<epic-id>/`
- Inside an epic folder, files are prefixed with the epic id:
  - `<epic-id>_primer.md`
  - `<epic-id>_implementation.md`
  - `<epic-id>_plan.md`
  - Optional: `<epic-id>_notes.md` or other supporting docs

## Files per epic

- `<epic-id>_primer.md` (owned by `#navigator`)
  - Problem description and context.
  - Goals and user stories.
  - Constraints, risks, and success criteria.
  - No implementation details or code yet.

- `<epic-id>_implementation.md` (owned by `#architect`)
  - High-level approach and architecture notes.
  - Data shapes, interfaces, and key decisions.
  - Tradeoffs and risks.
  - Still no direct code edits; this is senior-dev guidance.

- `<epic-id>_plan.md` (owned by `#pm`)
  - Checklist of tasks/slices that implement the epic.
  - Each task can have inline notes (for example, under the checkbox) capturing
    constraints or acceptance criteria:
    - "Must validate email format X."
    - "Must show inline error on blur."
  - Tasks should be small enough to implement and review in a single slice.

- Optional: `<epic-id>_notes.md`
  - Scratchpad for experiments or running thoughts that do not fit in the
    primer/implementation/plan files.

## Role expectations (hats)

These files are designed to be the IO for different roles:

- `#navigator`
  - Clarifies the problem and goals.
  - Writes or updates `<epic-id>_primer.md`.
  - Does not edit application code or tests.

- `#architect`
  - Reads the primer and proposes implementation strategy.
  - Writes or updates `<epic-id>_implementation.md`.
  - Does not edit application code or tests.

- `#projectManager`
  - Reads primer and implementation notes.
  - Breaks the work into tasks in `<epic-id>_plan.md`.
  - Ensures each task has clear notes and success criteria.

- `#coder`
  - Reads the epic primer, implementation notes, and plan.
  - Asks clarifying questions if anything conflicts with `AGENTS.md` rules.
  - Implements one task at a time from the plan, updating code/tests as needed.

Roles are advisory and opt-in: they are activated by the user in a chat (for
example, "navigator hat only") and use these files as their primary
input/output. The repo-level `AGENTS.md` files still define the non-negotiable
behavior for each directory.
