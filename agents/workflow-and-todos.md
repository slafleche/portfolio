# Module: workflow-and-todos

## Purpose

Keep work structured and predictable using a lightweight but explicit workflow
and TODO cadence.

## Key points

- Follow the “talk → clarify → TODO → go” cadence for non-trivial tasks.
- Capture plans in `TODO.*.md` files: Primer first, then checklist, then
  `### Step N — title` sections once the list is stable.
- For very small, low-risk edits, a brief inline plan in chat is acceptable; you
  do not need a new `TODO.*.md` for every tiny change.
- Before coding, pause to check: tokens are consumed directly, helpers are in
  use, and values are not re-aliased without a real transformation.
- For non-trivial work, start with the “elementary” pieces first (TypeScript
  types/interfaces, data shapes, small helpers/config) and only then wire
  components, APIs, or flows.
