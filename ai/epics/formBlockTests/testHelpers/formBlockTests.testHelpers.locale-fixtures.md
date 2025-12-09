# Spec — formBlockTests — Locale usage in block tests

This file clarifies how locales are handled for the `formBlockTests` epic.

## Goals

- Keep form-block tests focused on contract and UX, not on localization.
- Avoid introducing extra locale fixtures or dynamic translation behaviour
  into the block test harness.

## Approach

- Tests for form blocks:
  - Use the real English (`en`) form copy helpers directly.
  - Assert on English strings only when they need to check error or helper
    text.
  - Do not switch locales or exercise the translation pipeline.
- The shared harness and helpers:
  - Accept already-resolved `copy` props for the block under test.
  - Do not perform any locale lookup or translation logic themselves.

## Non-goals

- Do not create separate locale-fixture builders just for these tests.
- Do not attempt to validate French (`fr`) or other locales in this epic.
  Those behaviours are covered by the existing locale tests under `tests/locales/`.

