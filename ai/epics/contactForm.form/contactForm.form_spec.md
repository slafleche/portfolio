# contactForm.form — Spec

This spec describes the minimal behaviour of the `ContactForm` shell. It is
intended to be implementable without additional context.

## Structure

- Wrap children in:
  - A shared provider for form blocks (registration/validation/payload).
  - A shared provider or component for the message centre.
- Render each block component (e.g., Name, Email, Message, Turnstile,
  Honeypot) in the desired visual/DOM order.
- For each block, pass the shared base props from the block contract:
  - `id: string` — a unique identifier for this block instance within the form
    (for example, a safe-id prefix plus a logical suffix like `"name"`).
  - `order: number` — a monotonically increasing integer that reflects render
    order (1, 2, 3, …).
  - `disabled: boolean` — `true` whenever the shell wants to prevent user
    interaction with the block (for example, while a submission attempt is in
    flight).
  - `required?: boolean` — an optional hint used by blocks to show required
    indicators; it does not drive validation logic in the shell.

## State

- Local state:
  - `isSubmitting: boolean` — initialised to `false`.
  - Optional: a coarse `submitStatus` enum or string
    (`'idle' | 'success' | 'error' | 'blocked' | 'rate_limited' | …`) for UI
    affordances outside individual blocks.
  - An `invalid: boolean` flag that is set when a submission attempt fails
    validation and cleared only once validation passes again.
- No per-field state:
  - Do not store field values, errors, or validation flags in `ContactForm`.
  - Do not track “has attempted submit” or “continuous validation” flags in
    `ContactForm`.

## Integration with form-blocks infrastructure

- `ContactForm` must call into a shared “form-blocks” API exposed via a hook or
  context. The API must provide at least:
  - `validateAll(): boolean`
    - Triggers each registered block’s validation function from its contract.
    - Returns `true` only if all blocks report themselves valid.
    - May also populate internal validation summaries that an adjacent triage
      helper can use to derive messaging; `ContactForm` itself only needs the
      boolean result to decide whether to proceed with submission.
  - `collectPayload(): unknown`
    - Calls each block’s payload helper from its contract and aggregates the
      results into a single payload object suitable for submission.
    - The returned value is treated as opaque by `ContactForm`; it is forwarded
      to the submit helper without inspection or transformation.

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
    - Set `invalid` to `true`.
    - Do not call `collectPayload()`.
  - If `validateAll()` returns `true`:
    - Set `invalid` to `false`.
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
  - Map validation reasons or error codes to user-facing strings.
  - Decide which messages are inline vs global vs toast-like; that belongs to
    the message-centre layer and its helpers.
- `ContactForm` responsibilities:
  - Ensure the message-centre provider/component is rendered within the form so
    blocks and orchestration helpers can publish structured message data.
  - Cooperate with a triage helper (in the message-centre layer or an adjacent
    orchestration module) that:
    - Receives structured validation output from blocks.
    - Selects a single “priority” message per submission attempt based on
      severity and block order.
    - Exposes metadata such as a `scrollTarget` that `ContactForm` can use to
      drive scroll/focus recovery when needed.
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
