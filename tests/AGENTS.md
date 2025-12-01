# Agent Instructions for `tests`

This directory contains automated tests for application code, styles, scripts, and server logic.

## Responsibilities (`tests-layer`)

- Must: Keep tests small and focused, covering one behavior or interaction per test where practical.
- Must: Prefer existing test helpers and fixtures over re-implementing setup logic in each test file.

## Constraints (`tests-layer`)

- Must: Do not change production code behavior solely to “make tests pass” without explicit sign-off; fix the underlying bug or test expectations instead.
- Must: Avoid introducing hidden global state in tests; keep setup and teardown explicit and isolated.
- Must: Avoid real network or external service calls in tests; prefer mocks, fakes, or local test helpers instead.
