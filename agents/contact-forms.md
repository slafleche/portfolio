# Module: contact-forms

## Purpose

Coordinate contact and form-related UI with validation, rate limiting, and
localization layers.

## Key points

- Implement contact form UI, dialogs, and related primitives in
  `src/components/contact`, delegating validation and submission logic to
  modules and server utilities where possible.
- Wire UI state to the existing toast and debug mechanisms (for example,
  `toastDebugScenario`) instead of introducing parallel flows.
- Do not bypass rate limiting, Turnstile checks, or other guardrails encoded in
  `src/server` or related modules.
- Keep user-facing copy in the locales layer (`src/lib/locales`) rather than
  inlining it directly in components.
- Preserve accessibility: forms, dialogs, and focus management should remain
  screen-reader and keyboard friendly.
