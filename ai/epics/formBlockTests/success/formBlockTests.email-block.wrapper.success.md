# Success — formBlockTests — Email block wrapper

This file describes how the shared test harness should mount the `EmailBlock`
component so that its full test suite (contract + UX + focus) can run in a
consistent way.

## Context and provider

- Harness uses a provider compatible with `useFormBlock`:
  - Implements `registerBlock(registration)` and stores the latest
    registration for key `"email"`.
  - Exposes `continuousValidation: boolean` and an
    `enableContinuousValidation()` helper so tests can simulate the
    “post-submit” live-validation mode.
- The harness does not simulate full form submission or message-centre
  behaviour; it only provides the minimum context needed for the block
  contract and live-validation behaviour.

## Props supplied to `EmailBlock`

- Required props:
  - `id`: a stable string (for example `"test-email-block"`), used as:
    - The wrapper `div` id.
    - The `scrollTarget` in structured validation messages.
  - `order`: a numeric value (for example `0` or `1`); tests do not depend on
    the specific number beyond it being present.
  - `copy`: real English (`en`) EmailBlock locale with:
    - `label`.
    - `requiredText`.
    - `errors.invalid`.
  - `disabled`: default `false`; tests toggle to `true` when asserting
    disabled behaviour.
- Optional props:
  - `readOnly`: default `false`; explicitly set to `true` in tests that need
    to verify read-only behaviour.
  - `maxLength`: used in tests that need to exercise explicit length caps;
    otherwise may be omitted.

## Basic harness usage

- For contract and UX tests, the harness:
  - Calls `renderBlockWithFormBlocks(EmailBlock, baseProps)` with the props
    above.
  - Captures the registration for key `"email"` and exposes it to tests as
    `registration`.
  - Exposes a `getEmailContract()` helper (or equivalent) that returns the full `ContactFormBlockContract<string>` for the email block so tests can call `contract.validate()` to inspect structured validation results and `contract.getPayload()` for payload shape.
  - Provides a helper to toggle `continuousValidation` so tests can:
    - Start with `continuousValidation === false` (pre-submit).
    - Switch to `true` to simulate “after first submit”.
- Tests assert via `registration` that:
  - `key` is `"email"`.
  - `getValue()` reflects the current email value.
  - `validate()` returns the correct boolean for empty/invalid/valid emails.
  - `liveValidation` on the registration:
    - Is `false` on initial render.
    - Flips to `true` after the field has been blurred at least once.

## Focus choreography wrapping

- For focus tests, the harness:
  - Renders `EmailBlock` inside `FocusSentinelWrapper`, with:
    - A plain text input before the block (the “before” sentinel).
    - A plain text input after the block (the “after” sentinel).
  - Is invoked as
    `renderBlockWithFormBlocks(EmailBlock, baseProps, { wrapWithFocusSentinels: true })`.
- Tests then assert that:
  - `registration.focus()` moves focus to the `EmailBlock` input.

## Locale and environment assumptions

- Wrapper-level assumptions:
  - Always use English (`en`) form copy for `EmailBlock` tests.
  - Do not switch locales or perform translation lookups inside the harness.
- Broader behaviour such as triage or message-centre integration remains out
  of scope for this wrapper spec and is covered by the main contact-form epic.
