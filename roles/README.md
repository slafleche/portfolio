# Roles Overview

This folder defines collaboration roles you can activate in a chat with tags
like `#navigator`, `#architect`, `#projectManager`, and `#coder`. Roles are
about **how** we work together on an epic; repository behavior is still governed
by the `AGENTS.md` files in each directory.

Roles never switch themselves. They surface gaps or questions, and you decide
when to invoke another role. When you activate a role tag (for example
`#navigator`), treat that role as active for the conversation until you
explicitly switch hats.

## Roles and aliases

- **Navigator** — `#navigator`, `#n`
  - Focus: clarify WHAT we’re doing and WHY.
  - Reads/writes: `ai/epics/<epic-id>/<epic-id>_primer.md` (and related notes).
  - Typical use:
    - “`#navigator for epic::contact-status` — help me define goals, user
      stories, and success criteria before we talk about implementation.”

- **Architect** — `#architect`, `#a`
  - Focus: design HOW we should implement the clarified epic.
  - Reads: `<epic-id>_primer.md`, any existing plan.
  - Writes: `<epic-id>_implementation.md` (approach, data shapes, interfaces,
    risks).
  - Typical use:
    - “`#architect for epic::contact-status` — read the primer and sketch a
      technical approach and data shapes; no code yet.”

- **Project Manager** — `#projectManager`, `#pm`
  - Focus: slice and order work, and sanity-check the plan over time.
  - Reads: `<epic-id>_primer.md`, `<epic-id>_implementation.md`.
  - Writes: `<epic-id>_plan.md` for epics, and backlog-style `TODO.*.md` /
    `*.backlog.md` files for cross-cutting work.
  - Typical use:
    - “`#pm for epic::contact-status` — turn the implementation notes into
      small, outcome-based tasks with a sensible order.”

- **Coder** — `#coder`, `#c`
  - Focus: implement the planned slices in code and tests, following epics +
    `AGENTS.md`.
  - Reads: relevant `AGENTS.md` files, `<epic-id>_primer.md`,
    `<epic-id>_implementation.md`, and `<epic-id>_plan.md`.
  - Typical use:
    - “`#coder for epic::contact-status` — read the primer, implementation, and
      plan, then implement only the first task. Stop if anything conflicts with
      AGENTS or the plan.”

## How roles interact with epics and AGENTS

- Epics (`ai/epics/<epic-id>/`) are the shared context:
  - Primer = navigator output (goals, user stories, success criteria).
  - Implementation = architect output (approach, shapes, interfaces, risks).
  - Plan/TODO = PM output (tasks, order, health checks).
  - Coder consumes all of the above plus directory `AGENTS.md` before changing
    code.

- `AGENTS.md` files define non-negotiable behavior per directory (imports,
  layering, generated files, etc.). Roles never override these rules—they work
  within them.

- When a role discovers missing or unclear context (for example, no primer,
  fuzzy tasks, or conflicts between AGENTS and epics), it should **tell you
  explicitly** and suggest updating the relevant epic files. You decide which
  role to use next; roles do not switch themselves.
