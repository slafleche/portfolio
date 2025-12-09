# Success — ContactFormFlow

This file describes success criteria for the `ContactFormFlow` layer (hook/context), which owns the core “validate → maybe submit” orchestration for the contact form.

## Responsibilities

- Provide a single place where the contact form shell can:
  - Trigger validation across all registered blocks via the form-blocks contracts.
  - Conditionally collect an opaque payload when validation passes.
  - Invoke the submit helper with that payload and interpret its coarse result.
- Own coarse-grained submit state:
  - `isSubmitting`: `true` only while a submission attempt is in flight.
  - `invalid`: `true` when the last submission attempt failed validation and `false` once validation passes again.
  - `submitStatus`: a small enum/string representing coarse result
    (for example, `'idle' | 'success' | 'validation_error' | 'rate_limited' | 'service_unavailable' | 'blocked' | 'generic_error'`).
- Expose state and handlers to the `ContactForm` shell without exposing field-level values or messages.

## Inputs

- Form-blocks context:
  - A registry of block contracts that expose:
    - `validate(): ContactFormBlockValidationResult`.
    - `getPayload(): ContactFormBlockPayload<unknown>`.
- Submit helper:
  - A function that accepts an opaque payload and performs the `/api/contact` call (or equivalent).
  - Returns a result or throws in a way that can be mapped into the submit status codes.
- Optional callbacks:
  - A success-visibility callback (for example `onSuccessStateChange(visible: boolean)`) that downstream components can use to show or hide success panels.

## Outputs / API

`ContactFormFlow` exposes a stable interface (for example via `useContactFormFlow`):

- `handleSubmit(event: FormEvent<HTMLFormElement>)`:
  - Implements the JS-on-submit behaviour:
    - Prevents default native submission.
    - Ignores duplicate submits while `isSubmitting` is `true`.
    - Sets `isSubmitting` to `true` before kicking off validation.
    - Calls `validateAll()` across all registered blocks.
    - When any block is invalid:
      - Sets `invalid` to `true`.
      - Leaves or sets `submitStatus` to `'validation_error'` (or similar).
      - Resets `isSubmitting` to `false` and exits without collecting payload.
    - When all blocks are valid:
      - Sets `invalid` to `false`.
      - Calls `collectPayload()` to obtain an opaque payload.
      - Invokes the submit helper with that payload.
      - Maps the result or error into a coarse `submitStatus` value.
      - Resets `isSubmitting` to `false` when the attempt completes, regardless of success or failure.
- `isSubmitting: boolean`:
  - `true` only while `handleSubmit` is awaiting validation and/or the submit helper.
- `invalid: boolean`:
  - `true` after a failed validation attempt (client-side or server-side) and remains `true` until the next successful validation.
- `submitStatus: string`:
  - The latest coarse status derived from the submit helper or internal guards.
- `latestValidationResults: ContactFormBlockValidationResult[]`:
  - The most recent per-block validation results, suitable as input to the outcome/message-centre layer.
- `latestPayload: unknown | null` (optional):
  - The most recent payload object produced by `collectPayload()` when validation passed, primarily for debugging or outcome mapping; treated as opaque by the shell UI.

## Behavioural constraints

- Does not:
  - Inspect or translate individual message codes into user-facing strings.
  - Decide where on the page errors are shown or where the UI should scroll/focus; it only exposes state and raw validation results.
  - Depend on specific blocks (name/email/message/turnstile); it works purely in terms of registered contracts.
- Must:
  - Treat the payload as opaque and forward it unchanged to the submit helper.
  - Ensure `isSubmitting` is reset to `false` in all code paths (success, validation failure, network error, etc.).
  - Keep its public API stable so the shell and outcome layers can be tested with stub blocks as well as with the real form.

## Unit-test coverage — ContactFormFlow

Tests for `ContactFormFlow` focus on a small set of core scenarios:

- All blocks valid:
  - Arrange:
    - A few stub block contracts registered in the form-blocks context whose `validate()` methods all return `{ valid: true, messages: [] }`.
    - A submit helper stub that records its calls and resolves to a “success” result.
  - Act:
    - Call `handleSubmit` with a synthetic form submit event.
  - Assert:
    - `isSubmitting` transitions `false → true → false` over the course of the call.
    - `invalid` is `false` after completion.
    - `submitStatus` is set to `'success'` (or the agreed success code).
    - `collectPayload()` was invoked and the submit helper was called exactly once with the opaque payload.
    - `latestValidationResults` contains one valid entry per registered block.

- One or more blocks invalid:
  - Arrange:
    - At least one stub block whose `validate()` returns `{ valid: false, messages: [...] }`.
    - A submit helper stub that should never be called in this scenario.
  - Act:
    - Call `handleSubmit`.
  - Assert:
    - `isSubmitting` ends as `false`.
    - `invalid` is set to `true`.
    - `submitStatus` is set to `'validation_error'` (or equivalent).
    - `collectPayload()` is not called.
    - The submit helper is not called.
    - `latestValidationResults` reflect both valid and invalid blocks.

- Duplicate submit while in flight:
  - Arrange:
    - Stub blocks that all validate successfully.
    - A submit helper that intentionally delays (for example, returns a Promise that resolves after a tick).
  - Act:
    - Call `handleSubmit` twice before the first call has resolved.
  - Assert:
    - `isSubmitting` becomes `true` after the first call and stays `true` until the helper resolves.
    - The second call to `handleSubmit` performs no new validation or submit helper calls (idempotent while in flight).
    - The submit helper is called exactly once.

- Submit helper failure:
  - Arrange:
    - Stub blocks that all validate successfully.
    - A submit helper that rejects or throws (for example, simulating network or server failure).
  - Act:
    - Call `handleSubmit`.
  - Assert:
    - `isSubmitting` returns to `false` even when the helper fails.
    - `invalid` remains `false` (validation passed; the failure is at submit time).
    - `submitStatus` is set to a non-success code (for example, `'service_unavailable'` or `'generic_error'`) according to the mapping rules.
    - `latestValidationResults` still show all blocks as valid.

These tests are written against the hook/context using stubbed block contracts and submit helpers; they do not involve real Name/Email/Message/Turnstile blocks or DOM concerns.
