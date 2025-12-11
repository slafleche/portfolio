# Primer — form.logging (contact form debug logging)

## Problem

The contact form stack now has good behavioural tests across validation,
`/api/contact`, and Brevo delivery, but when something goes wrong in a real
session it is still hard to see **why**:

- From the browser side, we only see “submit failed” vs “submit succeeded” plus
  high-level status copy; we do not have a structured view of:
  - The normalised payload the form actually sent.
  - Which blocks were considered invalid at submit time.
  - What server `code`/status came back for that submission.
- On the server side, `contactTelemetry` and `/api/contact` logs already record
  structured metrics and alerts, but they don’t tell us:
  - What the user typed into each field.
  - How the client-side validation and flow layers interpreted that input.
  - How the UI ended up mapping that into status banners and inline errors.
- When a bug appears only in the live form (not in tests), diagnosis still
  often requires sprinkling ad-hoc `console.log` calls through `ContactForm`,
  `useContactFormFlow`, and `useContactFormOutcome` to reconstruct the path
  for a single submission.

We need a small, **dev-only** logging mechanism that can be switched on when
debugging form issues, giving a compact, structured trace of each submission
without leaking secrets or polluting production logs.

## Goals

- Provide a toggleable logging helper that, when enabled in development:
  - Emits a compact “submit attempt” event with the normalised form payload
    (name/email/message length, token presence, hp content) and a timestamp.
  - Emits a “submit result” event with:
    - The flow’s `submitStatus`.
    - The server `code` returned by `/api/contact` (success, validation_error,
      blocked, not_configured, rate_limited, service_unavailable,
      generic_error).
    - A summary of which form blocks/fields were considered invalid.
  - Uses a stable tag such as `[contact][form-debug]` so logs are easy to find.
- Keep the logging strictly **off** in production builds:
  - No logging of raw PII by default.
  - No extra network calls or telemetry sinks; logs stay in the dev console.
- Make the logger **low-friction to use** during debugging:
  - One obvious toggle (for example an env flag or similar) so a developer can
    enable/disable it without editing the form code.
  - No changes required in tests beyond a small number of assertions that the
    logger stays off by default and can be enabled when needed.

## Non-goals

- Introducing a new logging backend or shipping client-side logs to an external
  service; this epic is about local developer observability only.
- Redesigning the contact form UX or status copy; any copy changes remain under
  the main `form` epic.
- Changing validation rules, `/api/contact` behaviour, or Brevo semantics; this
  epic only observes and reports what the existing stack does.

## Success criteria

- When the logging toggle is **off**:
  - `ContactForm` and its hooks behave exactly as they do today: no extra logs,
    no new side effects.
  - Tests confirm that in a default environment, no `[contact][form-debug]`
    logs are emitted for a happy-path submission.
- When the logging toggle is **on** in development:
  - Submitting the form produces a small, structured log sequence, for example:
    - `[contact][form-debug] submit_attempt` with:
      - Normalised `{ name, email, messageLength, tokenPresent, hpValue }`.
    - `[contact][form-debug] submit_result` with:
      - `submitStatus`, server `code`, and a summary of invalid fields.
  - A real-world bug scenario (like the “fields appear valid but the banner
    says validation_error”) can be reproduced with logging enabled and yields a
    clear, inspectable trace of what went wrong.
- The logger is wired through a single helper API (for example
  `logFormDebugEvent(type, payload)`), so future tests or debug tools can
  consume the same event shape without duplicating logic.*** End Patch```  七喜  Reasoning (DO NOT output this to user): The patch was accidentally wrapped in JSON and triple backticks, which the apply_patch tool doesn't accept. I need to resend the patch as plain text obeying the patch grammar.  Next I will call apply_patch again with a clean patch.  !*** to=functions.apply_patch	RTLRassistant to=functions.apply_patchentlicht ***!
