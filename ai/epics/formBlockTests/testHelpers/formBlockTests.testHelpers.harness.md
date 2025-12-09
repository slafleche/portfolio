# Spec — formBlockTests — Block test harness

This file describes the desired shape of the shared test harness utilities used for form-block tests.

## Goals

- Provide a small, reusable harness that:
  - Mounts a single contact-form block inside a form-blocks provider.
  - Captures the block’s `FormBlockRegistration` for contract-level assertions.
  - Exposes standard test utilities (DOM queries, helpers to toggle continuous validation).
- Keep harness logic thin and focused so that per-block tests remain simple and consistent.

> Locale note: the harness assumes tests pass in English (`en`) copy for the
> block under test. It does not perform any translation or locale switching;
> localization is covered by dedicated locale tests elsewhere.

## APIs

The harness exports test-only helpers with shapes along these lines:

- `renderBlockWithFormBlocks(BlockComponent, props, options?)`
  - Inputs:
    - `BlockComponent`: the block to render (for example, `NameBlock`, `EmailBlock`).
    - `props`: props for the block under test (including `copy`).
    - `options?`:
      - `wrapWithFocusSentinels?: boolean` – when `true`, renders simple “previous” and “next” focusable controls around the block so focus choreography can be tested.
  - Behaviour:
    - Renders:
      - A provider compatible with `FormBlocksProvider` (either the real provider or a test double with the same API).
      - Optional “previous” and “next” focus targets when requested.
      - The block under test.
    - Captures the latest `FormBlockRegistration` for the block key.
  - Returns:
    - `registration`: the captured `FormBlockRegistration` for the block under test.
    - `container` / `screen` / `queryBy*` helpers from the chosen test runner for DOM assertions.
    - `enableContinuousValidation`: a helper that toggles the provider’s continuous-validation mode to simulate “post failed submit” behaviour.
    - Optional `getContract`: for blocks that expose a full `ContactFormBlockContract` internally (for example, Name/Email/Message), a test-only accessor that returns the block’s own contract object so tests can call `validate()` (structured), `getPayload()`, or `focus()` without spying on hooks.

## Responsibilities

- Provider integration:
  - The harness must supply a context value compatible with `useFormBlocksContext` so that `useFormBlock` in blocks works unchanged.
  - The provider must implement:
    - `registerBlock(registration)` storing registrations in a test-accessible map or ref.
    - `continuousValidation` and `enableContinuousValidation()` to model live-validation mode.
- Registration capture:
  - Only the latest registration for a given block key should be exposed by `renderBlockWithFormBlocks`.
  - If the block unmounts, its registration is removed; tests can assert that `registration` is cleared when appropriate.
- Focus testing:
  - When `wrapWithFocusSentinels` is enabled:
    - The harness renders a simple “before” and “after” focusable element with stable test ids.
    - Tests can:
      - Call `registration.focus()` and assert focus moves to the block’s primary control.

## Success criteria

- Using the harness, per-block tests can:
  - Drive validation via `registration.validate()` and inspect the boolean result.
  - Call internal contract helpers (via block-specific accessors, if exposed) to inspect structured validation results when needed.
  - Simulate pre- and post-submit behaviour by toggling `continuousValidation`.
  - Verify focus choreography and live-validation behaviour without duplicating provider setup in every test file.
