# Primer — form (contact form reliability & testing)

## Problem

The contact form is one of the most important flows on the site, but its
behaviour is still too fragile and opaque:

- In real usage, the form can show the generic validation banner (“Please check
  the fields and try again.”) even when the visible fields (Name, Email,
  Message) appear valid and the user expects a successful send.
- The source of failure is hard to pinpoint from the UI alone; the same
  top-level status message is used for:
  - Client-side validation errors on any field.
  - Server-side validation failures inside `/api/contact`.
  - Guardrails like Turnstile, honeypot, and rate limiting (via their status
    codes and copy).
- We have good piece-wise coverage (validation helpers, the contact API route,
  the form flow hook, the debug gallery), but no single “whole path” that gives
  strong confidence the end-to-end experience works as intended.

This epic captures the bug we hit in the real form and drives the testing and
debug tooling needed so that the entire contact stack is trustworthy.

## Context

- **Frontend layers**
  - `ContactForm` orchestrates blocks (Name, Email, Message, Turnstile,
    honeypot, message centre) and builds the payload for `/api/contact`.
  - `useContactFormFlow` runs field validation, coordinates submission, and
    translates server codes into a submit status.
  - `useContactFormOutcome` maps submit status + field errors into the messages
    shown in the message centre (inline status and toast).
  - Vanilla-extract styles in `forms.css.ts` control visual states for
    validation, disabled/read-only modes, success banners, and toasts.
- **Validation and server**
  - `validateDraft` normalises raw input and enforces:
    - Name length and emptiness.
    - Email syntax and emptiness.
    - Message length and URL-count limits.
    - Presence of the Turnstile token.
  - `/api/contact` layers:
    - Payload size guardrails.
    - Honeypot short-circuit that pretends success for bots.
    - Rate limiting keyed by IP / user agent.
    - Turnstile verification (`verifyTurnstileToken`) with `blocked` vs
      `not_configured` outcomes.
    - Brevo delivery (`deliverContactMessage`) mapped onto coarse
      `FormServerResponseCode` values.
    - Telemetry and logging for submission metrics and alerts.
- **Existing tooling**
  - Debug permutations under `app/[LOCALE]/debug/formelements` show many UI
    states and server codes but do not currently exercise the real API route
    end-to-end.
  - Tests exist for:
    - Validation helpers and draft normalisation.
    - `/api/contact` behaviour with mocked Turnstile and Brevo.
    - The form flow and outcome hooks.
    - The `ContactForm` component with mocked `fetch`.
  - There is a Brevo-focused testing epic (`brevo.deliveryTests`) and a
    production backlog entry for “Brevo Integration — Contact Flow Wiring”.

## Goals

- Turn the currently fuzzy “Please check the fields and try again.” bug into a
  precise, reproducible scenario with a clear root cause.
- Define and implement a minimal but robust set of integration / end-to-end
  tests that:
  - Exercise a realistic path from `ContactForm` through validation and the
    contact API route.
  - Cover both the “happy path” and the most likely failure modes a real user
    will see.
- Introduce lightweight dev/debug tooling for the form so that:
  - When something breaks, we can quickly see whether the issue is client-side
    validation, Turnstile, rate limiting, Brevo configuration, or something
    else.
  - We can diagnose issues without adding ad-hoc `console.log` calls all over
    the UI on every bug.
- Keep the form’s public contract stable:
  - Client payload shape remains `{ name, email, message, hp, token }` plus any
    existing metadata.
  - Server responses continue using the `FormServerResponseCode` surface and
    mapped copy in the locales layer.

## Non-goals

- Redesigning the contact form UX or copy beyond changes needed to correctly
  represent status and errors.
- Adding new external dependencies or a heavy E2E test runner if we can achieve
  confidence with the existing Next, Vitest, and testing-library stack.
- Changing rate limit, Turnstile, or Brevo semantics; the focus is on testing
  and observability around the existing behaviour.

## Success criteria

- The bug we observed (fields appear valid but the form still shows the generic
  validation banner and refuses to send) is captured as a testable scenario and
  has a documented root cause.
- We have explicit coverage at each key layer:
  - Validation layer (`validateDraft`):
    - A realistic, valid payload (for example “real world” Name/Email plus a
      message at or above `MESSAGE_MIN_LENGTH`) produces `errors = {}` and
      `status = null`.
    - A short-but-non-empty message just below `MESSAGE_MIN_LENGTH` produces
      `errors.message = 'form-error-message-too_short'` and
      `status = 'validation_error'`, with boundary tests that pin “just below”
      vs “just at/above” the threshold.
  - Flow layer (`useContactFormFlow` + form blocks):
    - When all blocks are valid, the flow calls its submit helper once with a
      full payload and reports `invalid = false` and a `success` submit status.
    - When only the Message block is invalid (short-but-non-empty), the flow
      reports `invalid = true`, `submitStatus = 'validation_error'`, does not
      call the submit helper, and exposes enough state to drive the “jump to
      first issue” control.
  - UI layer (`ContactForm` + outcome/message centre):
    - A realistic “should succeed” payload entered via the real form triggers
      exactly one submission, shows the success copy, and leaves no lingering
      validation banner.
    - With valid Name and Email but a too-short, non-empty Message, the form
      shows the validation banner and Message block error, does not call
      `fetch`, and keeps the outcome in a stable, testable state.
- There is at least one integration-style test that:
  - Drives `ContactForm` (or a thin harness around it) with realistic input.
  - Hits the real `/api/contact` handler or an equivalent in-process route
    rather than a hand-crafted mock response.
  - Fails in a meaningful way if we break Turnstile wiring, rate limiting,
    payload validation, or Brevo status mapping.
- The debug playground includes a way to inspect form submissions that mirrors
  what happens in production closely enough to debug issues without probing live
  traffic.
- When we ship changes to validation rules, `/api/contact`, or Brevo mapping, at
  least one test fails if the resulting UX regresses (for example, we start
  blocking valid submissions or mislabel a status).
