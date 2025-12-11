# Plan — form (contact form reliability & testing)

Backlog of concrete work items for the contact form bug, integration testing,
and debug tooling.

## 1. Bug capture and diagnosis

- [ ] Write a concise reproduction note for the observed bug: form shows “Please
      check the fields and try again.” even when Name/Email/Message appear valid
      and the user expects a successful send.
- [ ] Capture the exact field values and UI copy from the failing scenario
      (including which inline field messages, if any, are visible).
- [ ] Map the observed UI state onto the internal flow: - [ ] What
      `submitStatus` does the form flow see? - [ ] Are any field-level
      validations failing? - [ ] What does `/api/contact` return (code, HTTP
      status)? - [ ] Are Turnstile, honeypot, or rate limiting involved?
- [ ] Identify which existing tests _should_ have caught this scenario (if any),
      and note why they did not (e.g., mocking `fetch` too aggressively, missing
      Turnstile/rate-limit coverage, or incomplete outcome mapping).

## 2. Integration / end-to-end coverage

- [ ] Add at least one integration-style test that:
  - [ ] Drives `ContactForm` (or a thin shell) with realistic user input.
  - [ ] Uses the real `/api/contact` handler (with Turnstile/Brevo mocked at
        the server layer) instead of a hard-coded `fetch` response.
  - [ ] Asserts the happy path: no validation messages, `success` status, and
        appropriate success UI copy.
- [ ] Add tests for non-success server statuses as seen from the UI:
  - [ ] `validation_error` from the server (distinct from client-only errors).
  - [ ] `rate_limited` (with any countdown or retry hints).
  - [ ] `service_unavailable`.
  - [ ] `not_configured` (catastrophic, disables the form).
  - [ ] `blocked` (honeypot/Turnstile).
  - [ ] `generic_error`.
- [ ] For each status above, assert:
  - [ ] Correct global banner copy from the message centre.
  - [ ] Correct field disabling/readonly behaviour.
  - [ ] Presence or absence of the “jump to first issue” control where it makes
        sense (validation errors only).
- [ ] Add targeted coverage at each layer for the “short-but-non-empty message”
      scenario:
  - [ ] In `tests/contact/validation.test.ts`, add boundary tests around
        `MESSAGE_MIN_LENGTH` so that:
    - [ ] A message just below the threshold yields
          `errors.message = 'form-error-message-too_short'` and
          `status = 'validation_error'`.
    - [ ] A message at or above the threshold yields no message error and
          `status = null`.
  - [ ] In `tests/contact/ContactFormFlow.test.tsx`, add flow tests where:
    - [ ] All blocks are valid → submit helper is called once, `invalid = false`
          and submit status reflects success.
    - [ ] Only the Message block is invalid (short-but-non-empty) →
          `invalid = true`, submit helper is not called, and the latest
          validation results include the message block.
  - [ ] In `tests/contact/ContactForm.test.tsx`, add UI tests where:
    - [ ] A realistic “should succeed” payload (with a long-enough message)
          submits successfully, shows success copy, and leaves no validation
          banner.
    - [ ] A valid Name/Email but too-short Message yields a validation banner,
          a Message block error, and no `fetch` call.

## 3. Dev/debug tooling

- [ ] Decide on the primary dev/debug surface for the form: - [ ] Extend the
      existing debug page under `app/[LOCALE]/debug/formelements` to include the
      new scenarios uncovered while investigating this bug. - [ ] Optionally add
      a “live submission” card that uses the real `/api/contact` handler in a
      controlled environment.
- [x] Introduce a small, dev-only logging helper for the contact form that can
      be toggled on/off via `NEXT_PUBLIC_CONTACT_FORM_DEBUG`, and: - [x] Logs a
      compact summary of validation results and status codes on submit. - [x]
      Logs the normalised payload (without leaking secrets) when needed for
      diagnosis. - [x] Never runs in production builds.
- [x] Document how to use: - [x] The debug gallery to reproduce server-driven
      scenarios. - [x] The logging helper (see `form.logging` epic) to follow a
      submission’s path (validation, route result, status messages).

## 4. Hardening and regression guarantees

- [ ] Add or update tests so that changes to validation rules (for example,
      `MESSAGE_MIN_LENGTH`, URL limits, email pattern) that would break the UX
      also break tests unless the UX and copy are explicitly updated.
- [ ] Ensure `/api/contact` route tests stay aligned with the Brevo delivery
      epic: - [ ] Brevo-related statuses continue to map to the same
      `FormServerResponseCode` values expected by the UI and debug gallery. - [
      ] Turnstile and rate-limit semantics are preserved.
- [ ] Add at least one “whole-stack” smoke test that: - [ ] Exercises the happy
      path from `ContactForm` through the route with mocks for Turnstile and
      Brevo. - [ ] Fails in a clearly actionable way if any layer (validation,
      route, status mapping, or outcome) is miswired.
- [ ] Cross-link this epic from `ai/backlog/production.backlog.md` where it
      intersects with production-readiness work (Turnstile/Rate-limit/Brevo
      setup) once the integration tests and debug tooling stabilise.
