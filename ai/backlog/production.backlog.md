# Production Setup Backlog

## Primer

Backlog of production/infra tasks for this project: DNS, email delivery,
environment configuration, rate limiting stores, and installation/deployment
scripts. Items here are pulled into epics or one-off slices as needed.

## Brevo Integration — Contact Flow Wiring

### Primer

Goal: replace the mock contact submission stack with a production-grade Brevo
client while keeping the existing `/api/contact` contract stable for the UI
gallery.

Constraints:

- Client stays unchanged (still posts
  `{ name, email, message, locale, hp, token }`).
- Responses must keep the same `code/message` surface so debug permutations
  remain accurate.
- Everything must respect the tokens→helpers layering + `rules.yaml`.

Risks:

- Leaking secrets (API key, template IDs).
- Drifting response codes so the debug playground no longer matches production.
- Over-logging PII.
- Missing anti-abuse guards (honeypot, Turnstile, rate limits).

Brevo delivery and contact-flow tests are governed by epic
`brevo.deliveryTests` (see `ai/epics/brevo.deliveryTests/` for details); that
epic now provides full unit and route coverage for the Brevo delivery client,
`/api/contact`, and contact health route.

### Next — Deployment Prep

- [ ] Add SPF + DKIM records to GoDaddy; wait for Brevo to mark "authenticated".
- [ ] Switch rate-limit store to Upstash or similar KV.
- [ ] Run deliverability test (Gmail, Outlook) and confirm headers show aligned
      SPF/DKIM.
- [ ] Adjust `MAIL_FROM` domain if needed.

### Deferred — Step 9 (blocked until Vercel project exists)

- [ ] Mirror env vars in Vercel (never commit secrets).

### Deferred — Step 0 Prereqs (blocked until Vercel setup)

- [ ] Mirror `.env.local` secrets (`BREVO_API_KEY`, `MAIL_FROM`, `MAIL_TO`,
      Turnstile keys) into Vercel.
- [ ] Verify Brevo sender email(s) + document the setup in `README`.
