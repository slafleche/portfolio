# Primer — brevo.deliveryTests (Brevo delivery/client tests)

## Problem

The Brevo-backed contact flow is live-ready, but our tests only partially
exercise it:

- `deliverContactMessage` is covered for “not configured” and retry-on-timeout,
  but not for successful deliveries, non-retryable errors, or the rest of its
  retry matrix.
- `/api/contact` tests assert how we map Brevo-related `DeliveryResult` shapes
  into coarse response codes, but they rely on broad mocks and do not
  systematically cover the full set of status/error scenarios our mapping
  supports.
- The Brevo health probe route has basic tests, but we do not treat it as part
  of a coherent “Brevo surface” with clearly defined guarantees.

This leaves gaps: we could change retry logic, error summarisation, or
Brevo-to-form status mapping without tests catching regressions, even though the
UI and debug flows depend on those contracts.

## Goals

- Treat our Brevo integration as a first-class tested surface while keeping
  Brevo itself mocked:
  - Fully cover the behaviour of `deliverContactMessage` against a matrix of
    mocked `fetch` responses and errors.
  - Fully cover `/api/contact`’s mapping from `DeliveryResult` to public
    `code`/HTTP status for Brevo-related scenarios.
  - Clarify and test the behaviour of the Brevo health route as part of
    production readiness.
- Keep tests local:
  - Never call Brevo’s real API from tests.
  - Represent Brevo responses as synthetic `fetch` results (status + JSON) or
    errors and assert only **our** logic.

## Non-goals

- Do not add live integration tests that depend on real Brevo keys or network.
- Do not expand the public `/api/contact` contract beyond the existing
  `code/message` surface used by the UI and debug playground.
- Do not change existing rate-limit or Turnstile behaviours; we only test how
  Brevo fits into the existing flow.

## Success criteria

- `deliverContactMessage` unit tests:
  - Cover:
    - Successful delivery (Brevo returns 2xx such as 200/201/202/204).
    - Retryable errors:
      - Timeouts / aborted requests.
      - Network errors with no status.
      - Retryable HTTP statuses (e.g., 408/425/429 and 5xx) as described in
        Brevo’s HTTP code table.
    - Non-retryable errors:
      - 400 “validation-style” failures (e.g., `invalid_parameter`).
      - Other 4xx codes from the docs (401/402/403/404/405/406) treated as
        non-retryable by the client, grouped into our existing
        `validation_error`, `not_configured`, or `generic_error` buckets.
      - Non-JSON or unexpected error payloads.
    - “Not configured” case when `BREVO_API_KEY`/`MAIL_FROM`/`MAIL_TO` are
      missing.
  - Assert:
    - Number of attempts vs `MAX_BREVO_ATTEMPTS`.
    - `retries` and `retryReasons` contents.
    - Per-attempt `status`, `aborted`, and `errorSummary` fields.
    - Final `ok`/`status`/`error` shape.
- `/api/contact` tests:
  - Treat `deliverContactMessage` as an injected dependency (mocked).
  - Systematically cover the mapping from key `DeliveryResult` shapes to:
    - HTTP status (`200`, `400`, `401`, `403`, `429`, `500`, `503`, etc.).
    - Response `code` values (`success`, `validation_error`, `rate_limited`,
      `service_unavailable`, `not_configured`, `generic_error`, etc.), aligned
      with both Brevo’s documented HTTP codes and our `brevoStatusToCode`
      helper.
  - Maintain existing behaviour for honeypot short-circuit, Turnstile outcomes,
    and rate limiting; Brevo scenarios layer on top.
- Health route tests:
  - Explicitly treat the Brevo account probe as part of “production health”:
    - Missing env vars → “not configured”, no network call.
    - Brevo reachable (mocked 200) → `reachable: true`, include status.
    - Probe failures (mocked network error or non-200) → `reachable: false`,
      `error` summarised without leaking secrets.
