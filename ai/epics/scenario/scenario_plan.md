# Scenario epic — plan

- [ ] Define dev-only scenarios namespace and types
  - [ ] Add `src/dev/scenarios/hashRouting.ts` with `parseHashForTarget`.
  - [ ] Add `src/dev/scenarios/types.ts` with shared `DevScenario*` types.
- [ ] Implement contact form scenarios for v1
  - [ ] Define `ContactFormScenarioConfig` and `contactFormScenarios` map.
  - [ ] Seed a small set of visual scenarios (empty, email-invalid, message-too-short, etc.).
- [ ] Wire scenarios into the contact form
  - [ ] Add a dev-only hook/adapter in the contact form layer to:
    - [ ] Read the hash and extract `scenario` when the target is `contact-form`.
    - [ ] Look up the scenario and build `initialValues`.
    - [ ] Pass `initialValues` into `ContactForm` and seed field state.
- [ ] Add basic tests and docs
  - [ ] Add unit tests for `parseHashForTarget`.
  - [ ] Add at least one integration test that uses a scenario to prefill the contact form.
  - [ ] Document the URL convention and scenario usage in tests (for example, in a short note under `tests/contact/` and/or an AGENTS file).

