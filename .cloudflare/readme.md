# Cloudflare CORS Worker

This Worker is a CORS shim / proxy in front of a target origin. It handles
preflight (OPTIONS) requests and injects CORS headers for an explicit allow-list
of origins.

No build step. No Pages. Single-file Worker.

## Files

- cors_worker.js — Worker logic
- wrangler.toml — Deployment configuration

## Prerequisites

- Node.js
- Cloudflare account
- Wrangler installed and logged in

Install and authenticate:

```bash
npm i -g wrangler
wrangler login
wrangler whoami
```

## Updating Allowed Origins

Edit cors_worker.js and update the allow list:

- Add or remove origins in the Set
- Origins must match exactly (scheme + hostname + port)
- For Chromatic previews, the worker also supports hostname suffix allow rules
  (e.g. `.chromatic.com`) for production assets.

## Updating the Target Backend

In cors_worker.js, update the proxy target:

- Set url.protocol (usually https)
- Set url.hostname to the backend origin you want to proxy to

All incoming requests are forwarded to this origin.

## Deploying Updates

From the Worker directory, run:

```bash
wrangler deploy
```


OAuth credentials are stored locally and are not committed to the repository.

## Notes

- Uses module Workers syntax (export default with fetch)
- compatibility_date is pinned in wrangler.toml for reproducible behavior
- Intended to be versioned as infrastructure code
