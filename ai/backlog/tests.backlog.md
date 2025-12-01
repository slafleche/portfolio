# Test Backlog

## Primer

- Goal: capture high-value regression suites before extracting MeasurementKit
  (MK) and friends into a shared library.
- Focus: pure helpers (measurement math, typography, color/shadow utilities),
  validation logic, and new `/api/contact` endpoint behaviours.
- Tooling: Vitest for unit suites (MK, typography, helpers), React Testing
  Library for component-level validation checks, and
  `next-test-api-route-handler` for exercising API routes without booting a
  server.
- Philosophy: prefer fast unit tests for deterministic helpers, complement with
  lightweight integration tests for API routes and DOM-heavy flows that already
  exist.

## Bucket — End-to-End Routes

- [ ] **Locale-aware navigation (Playwright/Cypress)**
  - [ ] `/en` + `/fr` home pages:
        1. Assert URL contains the locale prefix and hero/CTA copy matches the
           expected translation keys (snapshot text or data-testid comparisons).
        2. Inspect the locale switcher—active locale should render in a disabled
           state while the alternate locale link points to the opposite slug
           (`/fr`⇄`/en`).
        3. Capture a screenshot or DOM dump to detect inadvertent regressions in
           primary marketing copy.
  - [ ] `/[locale]/systems` route:
        1. Deep-link directly (bypass landing page) to ensure middleware
           rewrites resolve to a 200 instead of a 404.
        2. Verify breadcrumbs/headings include the locale prefix and that all
           abbreviations render as `<abbr title="…">` elements—fail the test if
           any uppercase token lacks the expected markup.
        3. Toggle locales through the switcher and confirm the same slug reloads
           under the other prefix without losing content.
  - [ ] Debug pages (`/en/debug/{favicons, formelements, abbreviations}`):
        1. Run only in dev mode and assert each page loads with a locale-aware
           heading/path label (e.g., `Éléments de formulaire` for `fr`).
        2. Re-run under a production build and expect a 404/redirect to prove
           the guard rails prevents exposure in prod.
        3. Switch locales via the menu and ensure the debug route updates its
           prefix + breadcrumbs accordingly.

## Bucket — Component Tests (React Testing Library)

- [ ] `ContactForm` validation + focus flow: extend the existing suite to cover
      focus handoff after validation errors, CTA disabled/enabled transitions,
      and the success panel rendering logic (currently untested). Until this
      lands, the contact form isn’t fully covered.
- [ ] Contact dialog orchestration: mount `ContactDialogProvider`, open the
      dialog, submit success, and assert the form stays hidden until the dialog
      closes/reopens; also verify focus returns to the trigger and that toast
      helpers don’t double-announce status messages once they land. This is the
      last mile to claim end-to-end coverage of the dialog UX.

## Bucket — Middleware & Debug Guards

- [ ] Redirect + rewrite coverage: send request-level tests that `/` redirects
      to the preferred locale and that `/fr/systemes` rewrites to `/fr/systems`
      while unknown slugs fall back without 404s.
- [ ] Debug gating: assert `/[locale]/debug/*` paths succeed in dev mode but
      return 404 when `NODE_ENV=production`, matching the guard inside
      `middleware.ts`.
- [ ] Locale switcher persistence: after toggling locales via the menu, confirm
      the middleware preserves the current canonical path (systems/home/debug)
      rather than kicking users back to `/[locale]`.

