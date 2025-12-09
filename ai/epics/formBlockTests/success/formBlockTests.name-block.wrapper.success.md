# Success — formBlockTests — Name block wrapper

This file describes how the shared test harness should mount the `NameBlock`
component so that its full test suite (contract + UX + focus) can run in a
consistent way.

## Context and provider

- Harness uses a provider compatible with `useFormBlock`:
  - Implements `registerBlock(registration)` and stores the latest
    registration for key `"name"`.
  - Exposes `continuousValidation: boolean` and an
    `enableContinuousValidation()` helper so tests can simulate the
    “post-submit” live-validation mode.
- The harness does not simulate full form submission or message-centre
  behaviour; it only provides the minimum context needed for the block
  contract and live-validation behaviour.

## Props supplied to `NameBlock`

- Required props:
  - `id`: a stable string (for example `"test-name-block"`), used as:
    - The wrapper `div` id.
    - The `scrollTarget` in structured validation messages.
  - `order`: a numeric value (for example `0` or `1`); tests do not depend on
    the specific number beyond it being present.
  - `copy`: real English (`en`) NameBlock locale with:
    - `label`.
    - `requiredText`.
    - `errors.required`.
    - `errors.tooLong`.
  - `disabled`: default `false`; tests toggle to `true` when asserting
    disabled behaviour.
- Optional props:
  - `required`: default `true`; only overridden in tests that explicitly want
    to assert non-required behaviour.
  - `maxLength` / `minLength`: used in tests that need to hit specific
    length edge cases; otherwise defaults from `NAME_LIMIT` are acceptable.

## Basic harness usage

- For contract and UX tests, the harness:
  - Calls `renderBlockWithFormBlocks(NameBlock, baseProps)` with the props
    above.
  - Captures the registration for key `"name"` and exposes it to tests as
    `registration`.
  - Provides a helper to toggle `continuousValidation` so tests can:
    - Start with `continuousValidation === false` (pre-submit).
    - Switch to `true` to simulate “after first submit”.
- Tests assert via `registration` that:
  - `key` is `"name"`.
  - `getValue()` reflects the current input value.
  - `validate()` returns the correct boolean for invalid/valid values.
  - `liveValidation` on the registration:
    - Is `false` on initial render.
    - Flips to `true` after the field has been blurred at least once.

## Focus choreography wrapping

- For focus tests, the harness:
  - Renders `NameBlock` inside `FocusSentinelWrapper`, with:
    - A plain text input before the block (the “before” sentinel).
    - A plain text input after the block (the “after” sentinel).
  - Is invoked as
    `renderBlockWithFormBlocks(NameBlock, baseProps, { wrapWithFocusSentinels: true })`.
- Tests then assert that:
  - `registration.focus()` moves focus to the `NameBlock` input.

## Locale and environment assumptions

- Wrapper-level assumptions:
  - Always use English (`en`) form copy for `NameBlock` tests.
  - Do not switch locales or perform translation lookups inside the harness.
- Broader behaviour such as triage or message-centre integration remains out
  of scope for this wrapper spec and is covered by the main contact-form epic.
