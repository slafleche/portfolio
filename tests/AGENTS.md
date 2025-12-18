# Agent Instructions for `tests`

This directory contains automated tests for application code, styles, scripts,
and server logic.

## Responsibilities (`tests-layer`)

- Must: Keep tests small and focused, covering one behavior or interaction per
  test where practical.
- Must: Prefer existing test helpers and fixtures over re-implementing setup
  logic in each test file.

## Constraints (`tests-layer`)

- Must: Do not change production code behavior solely to “make tests pass”
  without explicit sign-off; fix the underlying bug or test expectations
  instead.
- Must: Avoid introducing hidden global state in tests; keep setup and teardown
  explicit and isolated.
- Must: Avoid real network or external service calls in tests; prefer mocks,
  fakes, or local test helpers instead.

## Structure vs behaviour in assertions (`tests-layer`)

- Must: Prefer asserting on behaviour and semantics (accessible name, role, ARIA
  attributes, focus order, submitted payload) rather than on specific DOM
  structure or tag names, unless the HTML/ARIA spec requires a particular
  structure.
- Should: Favour explicit, stable hooks such as `data-*` attributes or
  documented ids when selecting elements in contract-level tests (for example,
  form blocks), instead of relying on label text or incidental markup structure.
- Must: Treat tests that depend on brittle selectors (like nested tags or CSS
  classnames) as a smell; when this happens, prefer adding a small, explicit
  test hook to the component or fixing the component’s semantics rather than
  baking the brittle selector into the test.
- Should: When a test uncovers a genuine behaviour bug or HTML/ARIA issue in a
  component, change the component (with a clear assertion) instead of working
  around the bug in the test.

## Test-first workflow (`tests-layer`)

- Must: When the user asks you to write or extend a test, treat it as a
  specification that may fail until the corresponding behaviour is implemented;
  do not hide incomplete work behind skipped tests (`it.skip`, `describe.skip`,
  `test.skip`) or `.todo`.
- Must: Do not make new or updated tests trivially pass with placeholder
  expectations (for example, assertions that always succeed) when the real
  behaviour has not been wired up yet; it is better for the test to fail
  clearly and honestly until the feature is complete.

## Exploration vs current tests (`tests-layer`)

- Must: Treat existing tests as describing the current implementation, not the target of an in-progress design discussion.
- Must: When the user is exploring a new idea or challenging assumptions, do not change tests (or bend expectations) just to keep them green unless the user has explicitly asked to implement the new behaviour.
- May: Allow a proposed design to temporarily conflict with existing tests during the discussion/planning phase; only realign tests once the new behaviour is agreed and implementation has been requested.
