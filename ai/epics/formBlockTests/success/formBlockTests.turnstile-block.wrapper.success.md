# Success — formBlockTests — Turnstile block wrapper

This file describes how the shared test harness should mount the
`TurnstileBlock` component so that its test suite (contract + UX) can run in a
consistent way.

## Context and provider

- Harness uses a provider compatible with `useFormBlock`:
  - Implements `registerBlock(registration)` and stores the latest
    registration for key `"turnstile"`.
  - Exposes `continuousValidation: boolean` and an
    `enableContinuousValidation()` helper for consistency with other blocks,
    but tests do not rely on `continuousValidation` or `liveValidation` for
    Turnstile.
- The harness does not simulate full form submission or message-centre
  behaviour; it only provides the minimum context needed for the Turnstile
  contract and inline status summaries.

## Props supplied to `TurnstileBlock`

- Required props:
  - `id`: a stable string (for example `"test-turnstile-block"`), used as:
    - The wrapper `div` id.
    - The `scrollTarget` in structured validation messages.
  - `order`: a numeric value (for example `0` or `1`); tests do not depend on
    the specific number beyond it being present.
  - `copy`: real English (`en`) TurnstileBlock locale with:
    - `summary.missing`.
    - `summary.expired`.
    - `summary.error`.
    - `preview` (used when the widget is bypassed).
  - `disabled`: default `false`; tests toggle to `true` when asserting
    click-blocking behaviour.
- There is no `required` prop for this block. Focus-related props such as
  `onFocusBefore` / `onFocusAfter` are not used in this epic.

## Basic harness usage

- For contract and UX tests, the harness:
  - Calls `renderBlockWithFormBlocks(TurnstileBlock, baseProps)` with the
    props above.
  - Captures the registration for key `"turnstile"` and exposes it to tests
    as `registration`.
- Tests assert via `registration` that:
  - `key` is `"turnstile"`.
  - `getValue()` reflects the current token string for the current status.
  - `validate()` returns:
    - `true` for `status: 'verified'` or `'bypassed'`.
    - `false` for `status: 'loading'`, `'ready'`, `'expired'`, or `'error'`.
  - `getValidationSummary()` matches the inline status summary for each
    non-completed status (`missing`, `expired`, `error`).
  - `liveValidation` remains `false` and is not used for UX gating.

## Status control and environment

- The wrapper itself supplies only static props; tests control Turnstile
  statuses via dedicated test configuration helpers rather than additional
  wrapper props.
- Test configs:
  - A “good” Turnstile test config points at the real
    `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and should fail loudly if that key is
    missing or clearly invalid (smoke test for real configuration).
  - Additional fake configs are used to simulate other states (for example,
    bypassed mode, script-load failure, widget error, token expiration) by
    stubbing the script loader and `window.turnstile` under the hood.
  - Tests import and use these configs when they need to drive the block into
    a particular status; the wrapper spec itself does not encode those
    details.
- Tests also assert, independent of config details, that:
  - The hidden `input[name="token"]` matches the current token value.
  - When `disabled` is true, pointer interaction with the Turnstile container
    is blocked (clicks do not change `status` or `token`).

## Focus and sentinels

- This wrapper does not use `FocusSentinelWrapper`:
  - The Turnstile success criteria in this epic do not assert `focus`,
    or any related focus-before/after helpers.
  - The contract’s `focus()` implementation is a placeholder and not under
    test here.

## Locale and environment assumptions

- Wrapper-level assumptions:
  - Always use English (`en`) Turnstile copy for tests.
  - Do not switch locales or perform translation lookups inside the harness.
- All Turnstile interactions are simulated via environment and stubs; tests do
  not require network access to load the real Turnstile script.
