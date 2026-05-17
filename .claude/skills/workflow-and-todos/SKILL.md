---
name: workflow-and-todos
description: Use when planning non-trivial work, breaking down a feature, or when the user mentions epics, primers, plans, TODO files, "talk → clarify → TODO → go", or wants to structure a piece of work. Triggers on phrases like "let's plan this", "what's the approach", "make a TODO", or whenever a task is big enough that a written plan helps.
---

# Workflow and TODOs

Keep work structured and predictable using a lightweight but explicit workflow
and TODO cadence.

## Cadence

Follow "talk → clarify → TODO → go" for non-trivial tasks:

1. **Talk** — short discussion of the goal and shape.
2. **Clarify** — surface assumptions, ambiguities, constraints.
3. **TODO** — capture the plan in a file (see structure below) or as a
   concise inline checklist for small work.
4. **Go** — implement, one slice at a time.

For very small, low-risk edits, a brief inline plan in chat is acceptable —
you don't need a new TODO file for every tiny change.

## TODO file structure

When the work warrants a file:

- Per-epic plans under `ai/epics/<epic-id>/`:
  - `<epic-id>_primer.md` — navigator output (goals, user stories, success
    criteria).
  - `<epic-id>_implementation.md` — architect output (approach, data shapes,
    interfaces, risks).
  - `<epic-id>_plan.md` — PM output (tasks, order, health checks).
- Cross-cutting backlogs under `ai/backlog/` as `TODO.*.md` or
  `*.backlog.md`.
- Inside a TODO file: Primer first, then a checklist, then
  `### Step N — title` sections once the list is stable.
- Root-level TODOs should be rare and explicit.

If the user asks for a plan/backlog file, follow the structure above.

## Before coding

Quick check:
- Are tokens consumed directly (not re-aliased without a real transformation)?
- Are helpers in use (no hand-written guarded properties)?
- Are values flowing through measurement space until the emission boundary?

For non-trivial work, start with elementary pieces (TypeScript
types/interfaces, data shapes, small helpers/config) and only then wire
components, APIs, or flows.
