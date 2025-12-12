# Scenario epic — implementation notes

## High-level architecture

- Introduce a **dev-only scenarios layer** under a dedicated namespace:
  - `src/dev/scenarios/hashRouting.ts` — generic hash parsing helpers.
  - `src/dev/scenarios/types.ts` — shared types for scenario ids and loaders.
  - `src/dev/scenarios/contactForm.scenarios.ts` — contact-form specific scenarios for v1.
- Integrate with the contact form via a **thin adapter**:
  - Read the hash on the client in dev.
  - If it matches the `contact-form` target and includes a `scenario` id, look it up and pass initial values / flags into `ContactForm` as an optional prop.
  - Keep the adapter small and clearly dev-only.

## Hash parsing design

- Support patterns like:
  - `#contact-form&scenario=<id>`
  - Optionally, future variants like `#some-target&scenario=<id>&debug=1`.
- Basic parsing steps:
  - Strip leading `#`.
  - Split on `&` into segments.
  - First segment must match a target id (for example, `contact-form`).
  - Remaining segments are treated as simple `key=value` pairs; extract `scenario`.
- Exposed API (conceptual):
  - `parseHashForTarget(targetId: string, hash: string): { scenarioId: string | null }`
  - Generic enough to be reused by other features that adopt the same pattern.

## Scenario types and map

- Define shared types in `src/dev/scenarios/types.ts`, for example:
  - `DevScenarioId = string`.
  - `DevScenario<TConfig> = { id: DevScenarioId; label: string; config: TConfig }`.
  - `DevScenarioMap<TConfig> = Record<DevScenarioId, DevScenario<TConfig>>`.
- For the contact form, define a focused config type in `contactForm.scenarios.ts`, for v1:
  - `initialValues`:
    - `name?: string`
    - `email?: string`
    - `message?: string`
    - `token?: string` (turnstile)
    - `honeypot?: string`
  - Optional shell flags (future extension, but keep the type ready):
    - `startWithContinuousValidation?: boolean`
    - `forceSubmitStatus?: 'success' | 'validation_error' | 'rate_limited' | 'service_unavailable' | 'not_configured' | 'blocked' | 'generic_error'`
- Export a simple map for v1:
  - `contactFormScenarios: DevScenarioMap<ContactFormScenarioConfig>`.
  - A handful of hand-picked entries, for example:
    - `visualtest_empty` — all fields empty.
    - `visualtest_email_invalid` — prefilled invalid email.
    - `visualtest_message_too_short` — short message to show error copy.

## Contact form integration

- In `ContactForm` (or a small wrapper), add a dev-only hook:
  - On client mount, check `process.env.NODE_ENV !== 'production'`.
  - Read `window.location.hash`.
  - Call `parseHashForTarget('contact-form', hash)` to extract `scenarioId`.
  - If present, look up `contactFormScenarios[scenarioId]`.
  - If found, derive `initialValues` and pass them to the form via props.
- Form behaviour:
  - Accept an optional `initialValues` prop and seed local state (name/email/message/turnstile/honeypot) from it instead of empty strings.
  - Do not change validation logic; scenarios only influence starting state in v1.

## Safety and dev-only guarantees

- Guard all scenario logic with clear dev-only checks:
  - `if (process.env.NODE_ENV !== 'production') { ... }`.
  - Keep imports from `src/dev/scenarios/*` in client-only code paths where appropriate, so server-side bundles do not accidentally depend on dev helpers.
- Keep the scenarios small and explicit:
  - No dynamic imports or remote configuration.
  - No side effects beyond initialising component state.

## Reuse for other features

- Other components that want scenarios can:
  - Choose their own `targetId` (for example, `feature-x-panel`).
  - Create `src/dev/scenarios/featureX.scenarios.ts` with their own config type.
  - Use the same `parseHashForTarget` helper and URL convention `#feature-x-panel&scenario=<id>`.
- This epic will implement the pattern for the contact form and document the convention so other epics can opt in later without redefining the infrastructure.

