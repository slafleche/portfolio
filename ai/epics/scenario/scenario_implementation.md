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

## URL parsing design

- For the contact form, use a query + hash convention:
  - `/en?scenario=<id>#contact-form`
  - The `scenario` id lives in the **query string**, and the hash `#contact-form` gates whether the scenario should apply.
- Basic parsing steps for contact-form scenarios:
  - Read `window.location.hash` and confirm it resolves to the contact intent (for example, `#contact-form`).
  - If the hash does not point at `contact-form`, ignore any scenario id entirely.
  - If the hash matches, read `window.location.search`, parse simple `key=value` pairs, and extract `scenario=<id>`.
- The generic helper in `src/dev/scenarios/hashRouting.ts` can still support hash-only patterns (for example, `#feature-x-panel&scenario=<id>`) for other dev features that prefer fragment-based scenarios, but the contact form uses the query-based pattern above.

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
  - Read `window.location.hash` and `window.location.search`.
  - Confirm the hash points at the contact intent (for example, `#contact-form`).
  - If so, read `scenario=<id>` from the query string and look it up in the flattened `contactFormScenarioMap`.
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
  - Either:
    - Reuse the **query + hash** convention (`?scenario=<id>#feature-x-panel`), or
    - Opt into a **hash-only** fragment convention (for example, `#feature-x-panel&scenario=<id>`) and use a helper like `parseHashForTarget` for parsing.
- This epic will implement the pattern for the contact form and document the convention so other epics can opt in later without redefining the infrastructure.
