# contactForm.form — Spec

This spec describes the minimal behaviour of the `ContactForm` shell. It is
intended to be implementable without additional context.

## Structure

- Wrap children in:
  - A shared provider for form blocks (registration/validation/payload).
  - A shared provider or component for the message centre.
- Render each block component (e.g., Name, Email, Message, Turnstile,
  Honeypot) in the desired visual/DOM order.
- For each block, pass:
  - `order: number` — a monotonically increasing integer that reflects render
    order (1, 2, 3, …).
  - `isSubmitting: boolean` — true only while a submission attempt is in
    flight.

## State

- Local state:
  - `isSubmitting: boolean` — initialised to `false`.
  - Optional: a coarse `submitStatus` enum or string
    (`'idle' | 'success' | 'error' | 'blocked' | 'rate_limited' | …`) for UI
    affordances outside individual blocks.
- No per-field state:
  - Do not store field values, errors, or validation flags in `ContactForm`.
  - Do not track “has attempted submit” or “continuous validation” flags in
    `ContactForm`.

## Integration with form-blocks infrastructure

- `ContactForm` must call into a shared “form-blocks” API exposed via a hook or
  context. The API must provide at least:
  - `validateAll(): boolean`
    - Triggers validation in all registered blocks.
    - Returns `true` only if all blocks report themselves valid.
    - Blocks are responsible for updating any message-centre data as part of
      validation; `ContactForm` does not receive or inspect messages.
  - `collectPayload(): unknown`
    - Aggregates payload fragments from all registered blocks into a single
      payload object suitable for submission.
    - The returned value is treated as opaque by `ContactForm`; it is forwarded
      to the submit helper.

## Submit behaviour

- Handle native form submission (`onSubmit`):
  - Prevent default browser submission.
  - If `isSubmitting` is already `true`, ignore the event (avoid duplicate
    submits).
  - Set `isSubmitting` to `true` before triggering validation.
- Validation:
  - Call `validateAll()`.
  - If `validateAll()` returns `false`:
    - Set `isSubmitting` back to `false`.
    - Do not call `collectPayload()`.
    - Do not inspect which blocks failed or what messages exist.
  - If `validateAll()` returns `true`:
    - Call `collectPayload()` and store the result in a local variable
      `payload`.
    - Pass `payload` to a submit helper (a separate function that performs the
      API call).
- Submission:
  - Invoke the submit helper with the collected `payload`.
  - Await the result (async).
  - On success:
    - Update `submitStatus` to `'success'`.
    - Optionally signal success to parent components (e.g., via a callback) so
      they can close dialogs or show success panels.
  - On failure (non-success result or thrown error):
    - Map the failure to a coarse `submitStatus` value
      (e.g., `'error' | 'blocked' | 'rate_limited'`).
    - Do not generate or map field-level errors.
  - In all cases:
    - Set `isSubmitting` back to `false` once the submission attempt completes.

## Message-centre interaction

- `ContactForm` does not:
  - Create, store, or transform any message-centre data.
  - Map validation reasons to user-facing strings.
  - Decide which messages are inline vs global vs toast-like.
- `ContactForm` responsibilities:
  - Ensure the message-centre provider/component is rendered within the form so
    blocks can publish messages.
  - Optionally forward coarse `submitStatus` or high-level statuses from the
    submit helper into the message-centre layer (e.g., via a dedicated API),
    without touching individual field messages.

## Constraints and invariants

- `ContactForm` must remain agnostic to which specific blocks are present; it
  should work as long as blocks register with the shared infrastructure.
- Adding, removing, or reordering blocks should not require changing submit
  logic beyond wiring the new components and their `order` values.
- All field-specific behaviour (validation rules, error strings, counters,
  Turnstile widget handling) must live in block components or shared helpers,
  not in `ContactForm`.

