# Success — formBlockTests — Turnstile API and dummy keys

This file describes success criteria for tests that exercise the Turnstile
server-side verification helper and its interaction with Cloudflare’s dummy
keys and tokens. These tests live alongside (but separate from) the
`TurnstileBlock` UI and harness tests.

## Scope

- We are testing our helper, not Cloudflare’s API: tests always stub `fetch`, avoid real HTTP calls, and focus only on behaviours that can change based on our code and environment.
- Covers `verifyTurnstileToken` in `src/server/turnstile/verifyTurnstileToken.ts`.
- Focuses on:
  - How environment variables (`TURNSTILE_BYPASS`, `TURNSTILE_SECRET`) are
    interpreted.
  - How tokens are handled (including dummy tokens).
  - How responses and failures from the Turnstile verification endpoint are
    mapped to `TurnstileVerificationResult`.
- Does not cover:
  - The `TurnstileBlock` UI component (that is handled in the block and
    wrapper specs).
  - Network-level integration tests against the real Cloudflare endpoint.

## Core behaviours — `verifyTurnstileToken`

Tests cover the following behaviours assuming `fetch` is stubbed and
`process.env` is controlled per test:

- Bypass mode:
  - When `TURNSTILE_BYPASS` is set to `'1'` or `'true'` (case-insensitive),
    `verifyTurnstileToken()` returns `{ ok: true, reason: 'bypass' }`
    regardless of `TURNSTILE_SECRET` or `token`.
  - In bypass mode, no network call is made (the stubbed `fetch` is not
    invoked).
- Missing secret:
  - When `TURNSTILE_BYPASS` is not truthy and `TURNSTILE_SECRET` is unset or
    empty, calling `verifyTurnstileToken()` returns:
    - `ok: false`.
    - `errorCodes: ['missing-secret']`.
  - No network call is made in this case.
- Missing token:
  - With a non-empty `TURNSTILE_SECRET` and bypass disabled, calling
    `verifyTurnstileToken(null)` or `verifyTurnstileToken(undefined)` returns:
    - `ok: false`.
    - `errorCodes: ['missing-token']`.
  - No network call is made in this case.
- Successful verification:
  - With bypass disabled, a non-empty `TURNSTILE_SECRET`, and a non-empty
    `token`, the helper:
    - Issues a `POST` request to the Turnstile verification endpoint with:
      - `method: 'POST'`.
      - `content-type: 'application/x-www-form-urlencoded'`.
      - Body containing `secret=<TURNSTILE_SECRET>` and `response=<token>`.
      - `remoteip` included when a non-null `remoteIp` argument is provided.
    - When `fetch` resolves to a JSON body `{ success: true, ... }`:
      - Returns `{ ok: true }` (no `errorCodes` field).
- Failed verification:
  - When `fetch` resolves to a JSON body with `success: false` and an
    `error-codes` array:
    - Returns `{ ok: false, errorCodes: <that array> }`.
  - When `error-codes` is absent, returns `ok: false` with an empty
    `errorCodes` array.
- Network / unexpected error:
  - When `fetch` throws or rejects (for example, network error, invalid
    JSON), `verifyTurnstileToken()`:
    - Logs an error via `console.error` (tests may stub this).
    - Returns `{ ok: false, errorCodes: ['network-error'] }`.

## Dummy tokens and secret keys

Tests document and validate how the helper behaves when used with Cloudflare’s
dummy tokens and secret keys, as described in Turnstile’s testing docs.

- Dummy token shape:
  - Cloudflare’s test sitekeys emit a dummy token of the form
    `"XXXX.DUMMY.TOKEN.XXXX"`.
  - `verifyTurnstileToken()` treats tokens as opaque strings: tests assert
    that it never inspects or parses the token value locally and always sends
    the token unchanged in the `response` field of the verification request.
- Dummy secret keys:
  - Tests explicitly document the three official dummy secret keys:
    - `"1x0000000000000000000000000000000AA"` → “always passes validation”.
    - `"2x0000000000000000000000000000000AA"` → “always fails validation”.
    - `"3x0000000000000000000000000000000AA"` → “timeout-or-duplicate”
      (token already spent).
  - For each key, tests:
    - Set `process.env.TURNSTILE_SECRET` to the dummy value.
    - Use a representative dummy token (for example `"XXXX.DUMMY.TOKEN.XXXX"`).
    - Stub `fetch` to return the JSON payload that Cloudflare would return
      for that combination:
      - Always success → `{ success: true, ... }` → helper returns
        `{ ok: true }`.
      - Always fail → `{ success: false, 'error-codes': ['invalid-input-response'] }`
        → helper returns `ok: false` with the same `errorCodes`.
      - Timeout-or-duplicate → `{ success: false, 'error-codes': ['timeout-or-duplicate'] }`
        → helper returns `ok: false` with the same `errorCodes`.
  - Tests confirm that the helper neither hard-codes these error codes nor
    special-cases the dummy secrets: it simply forwards whatever the
    verification endpoint returns.

## Environment and configuration expectations

- Tests clarify and enforce the minimal environment contract:
  - `TURNSTILE_SECRET`:
    - Required for non-bypass verification.
    - May be a production key or one of Cloudflare’s dummy test secrets.
  - `TURNSTILE_BYPASS`:
    - When set to `'1'` or `'true'` (case-insensitive), verification is
      short-circuited with `ok: true`.
    - Any other value is treated as “off”.
- Tests may outline recommended environment usage, without enforcing specific
  values:
  - Development and automated test environments are expected to use
    Cloudflare dummy secrets (for example
    `"1x0000000000000000000000000000000AA"` or
    `"2x0000000000000000000000000000000AA"`) or enable `TURNSTILE_BYPASS`
    when network access is not available.
  - Production environments must not set `TURNSTILE_BYPASS` and must provide
    a real `TURNSTILE_SECRET`.

## Privacy and logging

- Tests assert that:
  - `verifyTurnstileToken()` never logs the token value or secret to
    `console.error` or other logs; only generic error information is logged
    on failures.
  - The returned `TurnstileVerificationResult` does not expose the secret or
    raw token, only `ok`, `errorCodes`, and `reason` (for bypass).
