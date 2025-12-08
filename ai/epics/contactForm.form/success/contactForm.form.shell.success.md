# Success — Contact form shell

This file describes success criteria for the `ContactForm` shell component.

## Structure and orchestration

- The shell renders a single `<form>` element that wraps all contact blocks and the message-centre, and it does not embed field-specific logic.
- Children are wrapped in providers for form blocks (registration/validation/payload) and the message centre so blocks can register themselves and publish messages.
- The shell accepts only coarse-grained props (for example, copy, submit helper, toast/debug hooks) and does not receive or pass down raw field values or per-field error flags.

## Form-blocks integration

- The shell uses a shared form-blocks API (via context or hooks) that exposes at least `validateAll()` and `collectPayload()`.
- On submit, the shell:
  - Prevents default browser submission.
  - Ignores duplicate submits while `isSubmitting` is `true`.
  - Calls `validateAll()` once per submission attempt.
- When `validateAll()` returns `true`, the shell calls `collectPayload()` and forwards the opaque payload to a submit helper; it does not inspect or transform field-level data.
- When `validateAll()` returns `false`, the shell cancels the submit attempt without calling the submit helper.

## Transport and submit helper

- The shell uses a JS submit helper as the primary submission path: it builds a payload via `collectPayload()`/per-block `getPayload` and calls the `/api/contact` route (or equivalent) using that payload, rather than relying on a native form POST as the main mechanism.
- A native `action`/`method` on the `<form>` element is optional and, if present, acts only as a progressive enhancement or legacy fallback; success for this epic means the JS submit path is the authoritative source of submit behaviour.

## Submit state and status

- The shell owns an `isSubmitting` flag initialised to `false` and flips it to `true` only while a submission attempt is in flight.
- The shell maintains a coarse submit status (for example, `'idle' | 'success' | 'error' | 'blocked' | 'rate_limited'`) driven solely by the submit helper result or guard failures, not by local validation details.
- On success, the shell:
  - Updates submit status to `'success'`.
  - Notifies parent components (for example, via a callback) so dialogs can show success panels or close.
- On failure, the shell:
  - Maps the failure into a coarse status value (for example, `'validation_error'`, `'rate_limited'`, `'service_unavailable'`, `'blocked'`, `'generic_error'`).
  - Leaves detailed messaging and copy to blocks and the message centre.
- In all cases, `isSubmitting` returns to `false` once the attempt completes.

## Error state and recovery

- The shell sets an internal “invalid” flag when a submission attempt fails validation (client-side or server-side) and clears it only when validation passes.
- While invalid:
  - The primary submit control is disabled and its descriptive text explains that errors must be fixed before submitting (while still referring to “submit”).
  - A small “jump to first error” style control is visible near the submit area.
- Activating the jump control runs a shared recovery protocol: scrolls the priority field into view and focuses it so the user can start editing immediately.
- As the user edits and blocks re-evaluate, live validation clears error-type messages; when no errors remain, the invalid flag is cleared, the jump control disappears, and the submit control returns to its normal behaviour.

## Message-centre interaction

- The shell does not construct or inspect field-level messages; blocks and shared helpers are responsible for turning validation results into messages.
- The shell ensures the message-centre provider/component is rendered inside the form so blocks and infrastructure can publish `MessageCentreTransmission` data.
- On each submission attempt, a triage helper (in the message-centre layer or an adjacent orchestration helper) selects a single priority message from the collected messages, based on severity and field order.
- The shell reuses metadata from the priority message (for example, a `scrollTarget`) only to drive scroll/focus behaviour; it does not map or rewrite message text.
- Toast decisions remain in the message-centre layer: at most one toast is surfaced per submission, based on the priority message’s `categoryError`, not per-field errors.
