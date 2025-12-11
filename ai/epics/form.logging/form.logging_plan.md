# Plan — form.logging

Backlog of concrete work items for dev-only contact form logging.

## 1. Logging design and toggle

- [x] Define the logging entry point:
  - [x] Implement a small helper (`logContactFormDebugEvent`) that accepts
        an event `type` and a structured `payload`.
  - [x] Standardise at least two event types:
    - [x] `submit_attempt` for normalised payload snapshots.
    - [x] `submit_result` for flow/route outcomes.
- [x] Decide on the toggle mechanism and scope:
  - [x] Prefer a simple runtime flag (an env-derived boolean) that can be
        enabled in dev and remains false in production builds.
  - [x] Ensure the toggle can be switched without editing `ContactForm` during
        normal dev work via `NEXT_PUBLIC_CONTACT_FORM_DEBUG`.
- [x] Specify the minimal payload shape for each event:
  - [x] `submit_attempt` includes normalised `name`, `email`,
        `messageLength`, `tokenPresent` (boolean), and `hpValue`.
  - [x] `submit_result` includes `submitStatus`, server `code`, and a summary
        of invalid fields/blocks.

## 2. Implementation and wiring

- [x] Implement the logging helper in the contact module:
  - [x] Only emit logs when the toggle is enabled and `NODE_ENV !== 'production'`.
  - [x] Use a consistent console tag such as `[contact][form-debug]`.
- [x] Wire logging into the form flow:
  - [x] In `ContactForm` / `ContactFormInner`, add a `submit_attempt` log
        before invoking `flow.handleSubmit`, using the same payload logic as
        `buildContactFormPayload`.
  - [x] Add a `submit_result` log whenever `submitStatus` changes from its idle
        state, including the server `code` (from the flow) and invalid fields
        derived from `latestValidationResults`.
- [x] Keep the wiring minimal and local:
  - [x] Avoid threading logging concerns into unrelated components; keep the
        helper at the ContactForm/flow layer.

## 3. Tests and documentation

- [x] Add tests to ensure the logger stays off by default:
  - [x] In a test environment with the toggle disabled, a happy-path submission
        produces no `[contact][form-debug]` logs.
- [x] Add tests to cover the enabled-path behaviour:
  - [x] When the toggle is enabled, a happy-path submission emits a
        `submit_attempt` and `submit_result` event with the expected shapes.
  - [x] A short-but-non-empty message scenario emits a `submit_result` with
        `submitStatus = 'validation_error'` and includes the message block in
        the invalid field summary.
- [x] Document usage:
  - [x] Add a short note to the main `form` epic or README describing how to
        enable the logger during debugging and what to look for in the logs.
  - [x] Cross-link this epic from the main `form` epic’s plan so future work on
        contact form reliability is aware of the logging tooling.
