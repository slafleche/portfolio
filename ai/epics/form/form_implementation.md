# Implementation notes — form (contact form reliability & testing)

## High-level approach

- Treat the contact form as a single, coherent flow that spans:
  - Field components and validation blocks.
  - The flow and outcome hooks.
  - The `/api/contact` route and its guardrails.
  - The debug gallery and any dev-only observability.
- Prefer integration-style tests that exercise multiple layers at once, backed
  by focused unit tests where necessary for tricky edge cases.
- Keep behaviour and messages defined in the locales and modules layers
  (`validation`, `form.status`, `form.*` locales); UI components and styles
  should remain thin, wiring-focused consumers.

## Testing strategy

- **Unit tests (existing and incremental)**
  - Keep fine-grained tests for:
    - Field validation (`evaluateNameField`, `evaluateEmailField`,
      `evaluateMessageField`, `evaluateTokenField`).
    - Draft normalisation (`normalizeInput`) and error mapping
      (`validateDraft`).
    - `/api/contact`’s mapping of Brevo `DeliveryResult` shapes into public
      `code`/HTTP statuses (coordinated with the `brevo.deliveryTests` epic).
  - Add any missing micro-tests that clarify new edge cases discovered as we
    investigate the current bug.

- **Component-level integration tests**
  - Use `tests/contact/ContactForm.test.tsx` as the primary harness to verify
    the form’s behaviour from the user’s perspective:
    - Happy path: all fields valid, Turnstile satisfied or bypassed, API
      responds with `success`, and the message centre stays quiet.
    - Validation errors: missing/invalid fields produce both field-level
      messages and the `validation_error` summary, with the “jump to first
      issue” control focusing the correct field.
    - Catastrophic statuses like `not_configured` disable the form and surface
      the appropriate copy.
  - Where possible, reduce reliance on ad-hoc `fetch` mocks by:
    - Routing `fetch` calls to the in-process `/api/contact` handler for a
      subset of tests, with Turnstile and Brevo still mocked at the server
      layer.
    - Reusing the same payload shape and locale loading logic that production
      uses.

- **Route-level integration**

- Use `tests/api/contact.route.test.ts` to validate:
  - Honeypot short-circuit behaviour.
  - Rate limiting, including retry headers.
  - Turnstile error codes mapped to `blocked` vs `not_configured`.
  - Brevo delivery outcomes mapped to `FormServerResponseCode` and HTTP
    statuses.
- Treat these tests as the contract between the form client and the rest of the
  backend; integration tests at the component level should make assumptions
  consistent with these route tests.

## Debug and observability strategy

- **Debug gallery**
  - Extend the existing debug page under `app/[LOCALE]/debug/formelements` to
    cover:
    - The new or clarified status codes and UX states discovered while fixing
      this bug.
    - Any server-driven scenarios we rely on (for example, blocked/honeypot,
      not-configured, Brevo failure).
  - Keep this gallery as a fast way to visually inspect:
    - How the message centre behaves for each status.
    - How field states (error, readonly, disabled, success) appear under
      different scenarios.

- **Dev-only logging**
  - Prefer a focused, opt-in logging helper instead of sprinkling raw
    `console.log` calls:
    - Log a concise snapshot of:
      - Latest validation results (which fields failed and why).
      - The normalised payload being sent to `/api/contact` (with care not to
        leak secrets).
      - The response `code` and mapped `FormStatusKey`.
    - Gate this behind:
      - An environment flag (for example, `NEXT_PUBLIC_CONTACT_DEBUG=1`), or
      - A local toggle in the debug gallery.
  - Ensure dev logging never runs in production builds or in shared environments
    where PII logging would be problematic.

## Layering and contracts

- Keep contracts clearly defined at each boundary:
  - Form blocks expose contracts via `useFormBlock` and the
    `ContactFormBlockContract` shape (validate, focus, getPayload).
  - The form flow hook (`useContactFormFlow`) exposes a `submitStatus` that is
    always a `FormServerResponseCode` or `'idle'`, and a `latestPayload` for
    debugging and tests.
  - The outcome hook (`useContactFormOutcome`) maps these into message-centre
    messages with a single priority message that drives scroll/focus.
  - `/api/contact` exposes a JSON response with `ok`, `code`, `message`, and
    optional extras like `retryAfterSeconds`, but does not leak internal error
    details.
- When we change any of these contracts as part of this epic, tests and debug
  scenarios should update in lockstep so that mismatches are caught early.
