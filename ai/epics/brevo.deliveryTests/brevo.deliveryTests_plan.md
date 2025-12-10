# Plan — brevo.deliveryTests

Backlog of concrete testing work for the Brevo delivery and contact flow.

## 1. Delivery client — `deliverContactMessage`

- [ ] Expand unit tests in `tests/server/deliverContactMessage.test.ts` to
      cover:
  - [ ] Successful delivery (Brevo `fetch` returns `ok: true`, 2xx).
  - [ ] Retry-on-timeout:
    - [x] Abort/timeout path (existing coverage).
    - [ ] Non-timeout network error (`fetch` rejects with a generic error).
  - [ ] Retryable HTTP failures:
    - [ ] 5xx responses with JSON error payloads.
    - [ ] 408/425/429 “transient” statuses.
  - [ ] Non-retryable HTTP failures:
    - [ ] 400 responses that represent Brevo-side validation errors.
    - [ ] Other 4xx responses from the docs (401/402/403/404/405/406) treated as
          non-retryable, mapped into our existing status buckets.
    - [ ] Unexpected/non-JSON response bodies.
  - [ ] “Not configured” env case (existing coverage) treated as part of the
        matrix.
- [ ] For each scenario, assert:
  - [ ] `attempts` length and per-attempt `status`, `aborted`, `errorSummary`.
  - [ ] `retries` and `retryReasons` contents match `shouldRetry` and
        `retryReasonFor`.
  - [ ] Final `ok`, `status`, and `error` fields match expectations.

## 2. Contact route mapping — Brevo outcomes

- [ ] In `tests/api/contact.route.test.ts`, ensure we have explicit tests that:
  - [ ] Map a successful `DeliveryResult` (`ok: true`, 2xx) to:
    - [ ] HTTP 200 with `code: 'success'`.
  - [ ] Map a Brevo validation failure (`ok: false`, status 400) to:
    - [ ] HTTP 400 with `code: 'validation_error'`.
  - [ ] Map Brevo “not configured” (`ok: false`, status 503,
        `Error('Brevo not configured')`) to:
    - [ ] HTTP 503 with `code: 'not_configured'` (existing coverage).
  - [ ] Map other Brevo failures:
    - [ ] 5xx errors (`ok: false`, status 5xx) → HTTP 500 with
          `code: 'service_unavailable'`.
    - [ ] Any remaining unexpected shapes → conservative `generic_error` mapping
          if the route supports it.
- [ ] Keep `deliverContactMessage` mocked; do not add tests that touch real
      Brevo.

## 3. Health route — Brevo probe behaviour

- [ ] Confirm and, if needed, extend `tests/api/contact.health.route.test.ts`
      to:
  - [ ] Assert no `fetch` call when required env vars are missing.
  - [ ] Assert Brevo reachable case (`ok: true`, status 200) sets
        `reachable: true`, `status`, and no `error`.
  - [ ] Assert probe failure (network error or non-200) sets `reachable: false`,
        includes a concise `error`, and does not leak secrets.

## 4. Documentation and production backlog alignment

- [ ] Update `ai/backlog/production.backlog.md` to cross-link this epic:
  - [ ] Note that “Brevo Integration — Contact Flow Wiring” depends on the
        `brevo.deliveryTests` epic for full test coverage.
  - [ ] Mark Brevo-related testing items in the production backlog as covered
        once the above tasks land.
