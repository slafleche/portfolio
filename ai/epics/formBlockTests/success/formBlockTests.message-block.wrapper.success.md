# Success — formBlockTests — Message block wrapper

This file describes how the shared test harness should mount the `MessageBlock`
component so that its full test suite (contract + UX + focus) can run in a
consistent way.

## Context and provider

- Harness uses a provider compatible with `useFormBlock`:
  - Implements `registerBlock(registration)` and stores the latest
    registration for key `"message"`.
  - Exposes `continuousValidation: boolean` and an
    `enableContinuousValidation()` helper so tests can simulate the
    “post-submit” live-validation mode.
- The harness does not simulate full form submission or message-centre
  behaviour; it only provides the minimum context needed for the block
  contract and live-validation behaviour.

## Props supplied to `MessageBlock`

- Required props:
  - `id`: a stable string (for example `"test-message-block"`), used as:
    - The wrapper `div` id.
    - The `scrollTarget` in structured validation messages.
  - `order`: a numeric value (for example `0` or `1`); tests do not depend on
    the specific number beyond it being present.
  - `copy`: real English (`en`) MessageBlock locale with:
    - `label`.
    - `requiredText`.
    - `errors.required`.
    - `errors.tooShort`.
    - `errors.tooLong`.
    - `errors.tooManyLinks`.
    - `counterTemplate`.
    - `maxCharactersMessage`.
    - `urlUsageTemplate`.
    - `maxUrlsMessage`.
  - `disabled`: default `false`; tests toggle to `true` when asserting
    disabled behaviour.
- Optional props:
  - `readOnly`: default `false`; explicitly set to `true` in tests that need
    to verify read-only behaviour.
  - `helperText`: default `undefined`/`null`; explicitly set in tests that
    verify how helper text interacts with error text.
  - `errorText`: default `undefined`; explicitly set in tests that verify
    external error overrides of local validation messages.

## Basic harness usage

- For contract and UX tests, the harness:
  - Calls `renderBlockWithFormBlocks(MessageBlock, baseProps)` with the props
    above (usually leaving `helperText`/`errorText` undefined unless a test
    needs them).
  - Captures the registration for key `"message"` and exposes it to tests as
    `registration`.
  - Exposes a `getMessageContract()` helper (or equivalent) that returns the full `ContactFormBlockContract<string>` for the message block so tests can call `contract.validate()` to inspect structured validation results and `contract.getPayload()` for payload shape.
  - Provides a helper to toggle `continuousValidation` so tests can:
    - Start with `continuousValidation === false` (pre-submit).
    - Switch to `true` to simulate “after first submit”.
- Tests assert via `registration` that:
  - `key` is `"message"`.
  - `getValue()` reflects the current textarea value.
  - `validate()` returns the correct boolean for each invalid/valid case in
    line with the shared message-field validation.
  - `liveValidation` on the registration:
    - Is `false` on initial render.
    - Flips to `true` after the field has been blurred at least once.

## Focus choreography wrapping

- For focus tests, the harness:
  - Renders `MessageBlock` inside `FocusSentinelWrapper`, with:
    - A plain text input before the block (the “before” sentinel).
    - A plain text input after the block (the “after” sentinel).
  - Is invoked as
    `renderBlockWithFormBlocks(MessageBlock, baseProps, { wrapWithFocusSentinels: true })`.
- Tests then assert that:
  - `registration.focus()` moves focus to the `MessageBlock` textarea.

## Locale and environment assumptions

- Wrapper-level assumptions:
  - Always use English (`en`) form copy for `MessageBlock` tests.
  - Do not switch locales or perform translation lookups inside the harness.
- Broader behaviour such as triage or message-centre integration remains out
  of scope for this wrapper spec and is covered by the main contact-form epic.
