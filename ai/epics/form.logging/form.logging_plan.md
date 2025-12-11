# Plan — form.logging

Backlog of concrete work items for dev-only contact form logging.

## 1. Logging design and toggle

- [ ] Define the logging entry point:
  - [ ] Implement a small helper (for example `logFormDebugEvent`) that accepts
        an event `type` and a structured `payload`.
  - [ ] Standardise at least two event types:
    - [ ] `submit_attempt` for normalised payload snapshots.
    - [ ] `submit_result` for flow/route outcomes.
- [ ] Decide on the toggle mechanism and scope:
  - [ ] Prefer a simple runtime flag (for example an env-derived boolean) that
        can be enabled in dev and remains false in production builds.
  - [ ] Ensure the toggle can be switched without editing `ContactForm` during
        normal dev work (for example via env, query param, or a small helper).
- [ ] Specify the minimal payload shape for each event:
  - [ ] `submit_attempt` includes normalised `name`, `email`,
        `messageLength`, `tokenPresent` (boolean), and `hpValue`.
  - [ ] `submit_result` includes `submitStatus`, server `code`, and a summary
        of invalid fields/blocks.

## 2. Implementation and wiring

- [ ] Implement the logging helper in the contact module:
  - [ ] Only emit logs when the toggle is enabled and `NODE_ENV !== 'production'`.
  - [ ] Use a consistent console tag such as `[contact][form-debug]`.
- [ ] Wire logging into the form flow:
  - [ ] In `ContactForm` / `ContactFormInner`, add a `submit_attempt` log
        before invoking `flow.handleSubmit`, using the same payload logic as
        `buildContactFormPayload`.
  - [ ] Add a `submit_result` log whenever `submitStatus` changes from its idle
        state, including the server `code` (from the flow) and invalid fields
        derived from `latestValidationResults`.
- [ ] Keep the wiring minimal and local:
  - [ ] Avoid threading logging concerns into unrelated components; keep the
        helper at the ContactForm/flow layer.

## 3. Tests and documentation

- [ ] Add tests to ensure the logger stays off by default:
  - [ ] In a test environment with the toggle disabled, a happy-path submission
        produces no `[contact][form-debug]` logs.
- [ ] Add tests to cover the enabled-path behaviour:
  - [ ] When the toggle is enabled, a happy-path submission emits a
        `submit_attempt` and `submit_result` event with the expected shapes.
  - [ ] A short-but-non-empty message scenario emits a `submit_result` with
        `submitStatus = 'validation_error'` and includes the message block in
        the invalid field summary.
- [ ] Document usage:
  - [ ] Add a short note to the main `form` epic or README describing how to
        enable the logger during debugging and what to look for in the logs.
  - [ ] Cross-link this epic from the main `form` epic’s plan so future work on
        contact form reliability is aware of the logging tooling.

