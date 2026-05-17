---
name: contact-forms
description: Use when working on the contact form, contact dialogs, form validation, rate limiting, Turnstile, or related UI under src/components/contact. Also triggers on tasks mentioning the contact API route, messageCentre, or "missing markdown copy" warnings on contact-related locale keys.
---

# Contact forms

Coordinate contact and form UI with validation, rate limiting, and
localization layers.

## Rules

- Implement contact form UI, dialogs, and related primitives under
  `src/components/contact`. Delegate validation and submission logic to
  modules and `src/server/` utilities.
- Wire UI state to the existing `messageCentre` and debug mechanisms (e.g.
  `messageCentreDebugScenario`) instead of introducing parallel flows.
- Don't bypass rate limiting, Turnstile checks, or other guardrails encoded
  in `src/server/` or related modules.
- Keep user-facing copy in the locales layer (`src/lib/locales/`) rather than
  inlining it in components.
- Preserve accessibility: forms, dialogs, and focus management remain screen
  reader and keyboard friendly.
- When you see a warning about "missing markdown copy" for a key, add the
  corresponding `.md` file under `src/lib/locales/translations/markdown/` and
  wire it via `markdownRefs('<key>')` in each locale's `*.data.ts` file.
