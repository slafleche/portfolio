# Agent Instructions for `src/components/contact`

This directory focuses on contact and form-related UI.

## Responsibilities (`components-layer`, `contact-forms`)

- Must: Implement contact form UI, dialogs, and related primitives, delegating validation and submission logic to modules and server utilities where possible.
- Must: Wire UI state to the existing toast and debug mechanisms (for example, `toastDebugScenario`) instead of introducing parallel flows.

## Constraints (`contact-forms`, `localization`)

- Must: Do not bypass rate limiting, Turnstile checks, or other guardrails encoded in `src/server` or related modules.
- Must: Keep user-facing copy in the locales layer (`src/lib/locales`) rather than inlining it directly in components.
- Must: Preserve accessibility: forms, dialogs, and focus management should remain screen-reader and keyboard friendly.
