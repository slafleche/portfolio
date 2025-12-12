# Scenario epic — dev scenarios and URL hooks

## Problem

- It is hard to **visually inspect and style** specific UI states (for example, contact form error combinations) without writing throwaway debug pages or manually reproducing conditions.
- Existing test harnesses cover behaviour well, but they do not give a **direct, URL-based way** to load a particular state in the real app.
- We want a solution that is:
  - **Dev-only** (never affects production),
  - **Generic** enough to reuse beyond the contact form,
  - **Simple** to reason about and not another heavy catalogue to maintain.

## Goals

- Allow developers to open the real app (for example, `/en`) with a **URL-based scenario identifier** (for example, `?scenario=<id>#contact-form`) and have a target UI (for example, the contact form) load a predefined **dev scenario** (for example, loading/success/failure shell states) without manual reproduction.
- Keep the mechanism **generic** so other features can opt in using their own target ids and scenario maps.
- Keep scenario definitions in **TypeScript**, so tests and dev UI can share them without duplicating state descriptions.
- Ensure the system is **no-op in production** and when no scenario is specified.

## Non-goals

- Do not build a full visual-regression system or a complete scenario catalogue in this epic.
- Do not force tests to source all data through scenarios; tests can still use explicit fixtures where that is clearer.
- Do not change existing routing or hash semantics beyond reading additional keys.

## Success criteria

- In development, when the URL looks like `/en?scenario=<id>#contact-form`, the contact form layer:
  - Detects the `scenario` id from the query string when the hash matches the contact form target, and
  - Applies a matching **dev scenario** (for example, loading/success/failure shell views) without requiring manual interaction.
- The contact form scenarios and helpers live in a **generic dev namespace** (for example, `src/dev/scenarios/`) and can be reused by other features with minimal wiring.
- The scenario map for the contact form is defined in TypeScript and can be imported from `src/dev/scenarios/contactForm.scenarios.ts`; future work may use this map to drive richer state (for example, initial field values) once the wiring is in place.
- In production builds:
  - Scenario parsing and application are effectively disabled or compiled out.
  - Normal behaviour is unchanged when no scenario id is provided.
