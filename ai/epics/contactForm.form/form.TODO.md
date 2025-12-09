# TODO — contactForm.form shell updates

This file tracks concrete implementation gaps for the `ContactForm` shell, based on the current spec and success docs. It focuses on behaviour and wiring, not copy.

## 1. Orchestration helpers and testability

- [ ] Introduce a dedicated shell orchestration hook (`useContactFormFlow`) that owns submit state and behaviour, instead of inlining logic directly into `ContactForm`:
  - [ ] The hook should read from the form-blocks context, not from individual blocks.
  - [ ] It should return `handleSubmit`, `isSubmitting`, `invalid`, `submitStatus`, and any data needed for messaging/triage.
- [ ] Introduce a small outcome/message-centre coordination helper (`useContactFormOutcome`) that turns validation/submit results into:
  - [ ] A flattened `MessageCentreMessages` object for `MessageCentreBlock`.
  - [ ] A single priority message (including `scrollTarget` and catastrophic flag) for scroll/focus behaviour.
- [ ] Keep `ContactForm` as thin glue:
  - [ ] Call the shell hook and coordinator.
  - [ ] Pass only booleans/objects returned by those helpers into blocks, the submit button, and the message centre.

## 2. Shell state and submit orchestration

- [ ] Add shell-level state:
  - [ ] `isSubmitting: boolean` (initially `false`).
  - [ ] `invalid: boolean` (initially `false`).
  - [ ] `submitStatus: 'idle' | 'success' | 'error' | 'blocked' | 'rate_limited' | 'validation_error' | 'service_unavailable' | 'not_configured' | 'generic_error'` (or equivalent).
- [ ] Implement a JS `onSubmit` handler on the `<form>` element:
  - [ ] Prevent default native submission.
  - [ ] Early-return if `isSubmitting` is already `true` to avoid duplicate submits.
  - [ ] Set `isSubmitting` to `true` before validation.
  - [ ] Call the form-blocks `validateAll()` helper:
    - [ ] If `false`, set `invalid: true`, reset `isSubmitting: false`, and exit without calling `collectPayload()` or the submit helper.
    - [ ] If `true`, clear `invalid` and proceed to payload collection.
  - [ ] Call `collectPayload()` to gather the opaque payload from all blocks.
  - [ ] Invoke the submit helper with the collected payload:
    - [ ] On success, set `submitStatus: 'success'` and notify listeners via `onSuccessStateChange?.(true)`.
    - [ ] On failure, map the result into a coarse `submitStatus` (`'validation_error' | 'rate_limited' | 'service_unavailable' | 'blocked' | 'generic_error' | …`).
    - [ ] In all cases, reset `isSubmitting` to `false` when the attempt completes.

## 3. Form-blocks API usage

- [ ] Expose a thin form-blocks API from `formBlocks.context` for the shell:
  - [ ] `validateAll(): boolean` — walks all registrations and returns `true` only when every block’s `validate` reports valid.
  - [ ] `collectPayload(): unknown` — calls each block’s `getPayload()` and returns a combined, opaque payload object.
- [ ] In `ContactForm`, replace any implicit assumptions about fields with calls to this API:
  - [ ] Never read block values or error states directly.
  - [ ] Treat the payload as opaque and forward it unchanged to the submit helper.

## 4. Block wiring and disabled state

- [ ] Keep `formMembers` as the single source of block base props (`id`, `order`, `required`, etc.).
- [ ] Drive the `disabled` flag from shell state instead of hard-coding `false`:
  - [ ] While `isSubmitting` is `true`, pass `disabled: true` to all blocks.
  - [ ] While a catastrophic condition is active (see section 5), keep all blocks and the submit control disabled.
  - [ ] Otherwise, pass `disabled: false` (or any future per-block disabled logic).

## 5. Message-centre presence and data flow

- [ ] Ensure a message-centre provider/component is rendered inside the form:
  - [ ] Wrap the blocks with the message-centre provider so orchestration helpers can publish structured message data.
  - [ ] Render a single `MessageCentreBlock` instance in the form layout, near the submit area.
- [ ] Thread triage results into the block:
  - [ ] Accept pre-flattened `MessageCentreMessages` (inline strings + optional higher-order toast summary) from the message-centre coordination helper.
  - [ ] Pass those `messages` directly into `MessageCentreBlock`.
  - [ ] Do not build or translate messages inside `ContactForm`; it only forwards what triage/helpers provide.

## 6. Priority message, scroll/focus, and catastrophic handling

- [ ] Integrate with a triage/priority helper (in the shell or an adjacent module) that:
  - [ ] Receives full validation results from blocks (including `scrollTarget`).
  - [ ] Selects a single priority message per submission attempt, based on severity and block order.
  - [ ] Exposes that priority message (including `scrollTarget`) plus flattened inline/summary strings.
- [ ] Use the priority message for recovery behaviour:
  - [ ] When `invalid` is `true` and the priority message is not catastrophic:
    - [ ] Implement the “jump to first error” control near the submit area.
    - [ ] When activated, scroll to the element identified by `scrollTarget` and call the corresponding block’s `focus()` contract.
  - [ ] When the priority message is catastrophic (e.g. Turnstile unavailable):
    - [ ] Disable all interactive fields and the submit button.
    - [ ] Scroll to the message-centre region instead of a specific field so the catastrophic message is encountered first.

## 7. Submit button and invalid-state UX

- [ ] Use the existing `SubmitButton` primitive inside `ContactForm`:
  - [ ] Wire it to the JS `onSubmit` handler (via `type="submit"` on the button and `onSubmit` on the `<form>`).
  - [ ] Apply the disabled state when:
    - [ ] `isSubmitting` is `true`.
    - [ ] `invalid` is `true` (post-failed validation) until errors are cleared.
    - [ ] A catastrophic condition is active.
  - [ ] While `invalid` is `true`, ensure:
  - [ ] The submit button’s descriptive text communicates that errors must be fixed before submitting (reusing copy from `ContactFormCopy`).
  - [ ] A small “jump to first error” control is visible near the submit button and wired to the priority message’s recovery behaviour.

## 8. Native vs JS submission

- [ ] Treat JS submission as the authoritative path:
  - [ ] Keep the `<form>` element on the page, but rely on `onSubmit` + the submit helper rather than native `POST` for behaviour.
  - [ ] If `action`/`method` remain on the `<form>`, treat them purely as progressive enhancement / backup and ensure the JS path is still the primary execution route.

## 9. Shell tests with stub blocks

- [ ] Add a test-only harness component that exercises the shell hook without real blocks:
  - [ ] Use `TestFormBlocksProvider` and register a small number of fake blocks whose contracts (`validate`, `getPayload`, `focus`) can be controlled per test.
  - [ ] Render only minimal DOM: a `<form>`, a submit button, and a stubbed message-centre consumer, so tests stay focused on shell behaviour.
- [ ] Write shell tests that:
  - [ ] Simulate submit flows where all fake blocks validate successfully and assert payload collection + submit helper calls.
  - [ ] Simulate validation failures (including catastrophic) and assert `invalid`, `isSubmitting`, and `submitStatus` transitions.
  - [ ] Verify that the “jump to first error” behaviour and catastrophic scroll-to-message-centre behaviour are driven entirely by the priority message metadata (via fake `scrollTarget` and `focus` implementations), without involving real Name/Email/Message/Turnstile blocks.
