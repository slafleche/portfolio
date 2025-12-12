# Scenario epic — implementation notes

## High-level architecture

- Introduce a **dev-only scenarios layer** under a dedicated namespace:
  - `src/dev/scenarios/hashRouting.ts` — generic hash parsing helpers.
  - `src/dev/scenarios/contactForm.scenarios.ts` — contact-form specific scenarios and helpers for v1.
  - `src/dev/scenarios/contactForm.adapter.ts` — contact-form specific URL adapter.
- Integrate with the contact form via a **thin adapter**:
  - Read the hash + query string on the client in dev.
  - If the hash matches the `contact-form` target and includes a `scenario` id, resolve the id and let the contact form shell derive its dev state (for example, loading/success/failure).
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

- For the contact form, define a focused config type in `contactForm.scenarios.ts`:
  - `ContactFormScenarioConfig`:
    - `id: string`
    - `label: string`
    - Optional `initialValues` for field prefills:
      - `name?: string`
      - `email?: string`
      - `message?: string`
      - `token?: string` (Turnstile)
      - `honeypot?: string`
    - Optional `devState` shell flags to influence the form shell:
      - `isSubmitting?: boolean`
      - `forcedSubmitStatus?: 'success' | 'validation_error' | 'rate_limited' | 'service_unavailable' | 'not_configured' | 'blocked' | 'generic_error'`
    - Optional `variants?: Record<string, ContactFormScenarioConfig>` for nested variant trees.
- Export a simple tree for v1 in `contactForm.scenarios.ts`:
  - `contactFormScenarios: Record<string, ContactFormScenarioConfig>` with entries such as:
    - `loading` — loading shell state.
    - `success` — success shell state.
    - `failure` — generic failure shell state, with nested variants for `blocked` and `service_unavailable`.
- Flatten the tree into a map:
  - `contactFormScenarioMap: Record<string, ContactFormScenarioConfig>`.
  - Variant ids are composed from the path, for example `failure-blocked`, `failure-service_unavailable`.
  - In the current v1 wiring, the contact form shell uses the `scenario` id directly (for example, `loading`, `success`, `failure-*`) and the map is available for future, richer scenarios (for example, field prefills).

## Contact form integration

- In `src/dev/scenarios/contactForm.adapter.ts`, add a dev-only helper:
  - On the client, check `process.env.NODE_ENV !== 'production'`.
  - Read `window.location.hash` and `window.location.search`.
  - Confirm the hash points at the contact intent (for example, `#contact-form`) using a shared string constant.
  - If so, read `scenario=<id>` from the query string, normalise it, and return the id.
  - Ensure the helper is idempotent per page load (only the first consumer wins) to avoid duplicate scenario application.
- In `ContactForm`, use the adapter to drive dev-only shell states:
  - On mount, call `resolveContactFormScenarioIdFromLocation` and store the id in local state.
  - Derive simple booleans such as:
    - `isDevLoadingScenario` — `scenarioId === 'loading'`.
    - `isDevSuccessScenario` — `scenarioId === 'success'`.
    - `isDevFailureScenario` — `scenarioId` starts with `failure`.
  - Use these flags to:
    - Select between loading/success/failure panels in the contact dialog shell.
    - Keep the dialog title in sync with the current dev scenario.
- Form behaviour:
  - Validation and submission logic remain unchanged; scenarios currently influence only the shell view (loading/success/failure).
  - Future work can use `contactFormScenarioMap` and `initialValues` to seed field state without changing validation rules.

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
