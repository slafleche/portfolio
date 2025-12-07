# Agent Instructions for `app/[LOCALE]/debug`

This directory contains debug sandboxes and inspection pages. Changes here
must not leak into production behaviour.

## Tokens and isolation

- Must: Keep debug pages self-contained; do not add or modify entries in
  `src/tokens` as part of work on files under `app/[LOCALE]/debug/`.
- Must: By default, do not import tokens (`@/tokens/...`) into debug pages.
- May: When a specific debug sandbox genuinely needs to inspect real token
  values (for example, to visualise form layouts), you may whitelist token
  imports for that page explicitly in this file; do not introduce new token
  imports from debug pages without adding or updating a whitelist entry.

### Whitelisted token imports

- `app/[LOCALE]/debug/formelements/SubmissionTimelineSection.tsx`
  - Allowed imports only:
    - `formTokens` from `@/tokens/forms.tokens`
    - `glassyButtonTokens` from `@/tokens/glassy.tokens`
