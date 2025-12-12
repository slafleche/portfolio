# Scenario epic — dev scenarios and URL hooks

## Problem

- It is hard to **visually inspect and style** specific UI states (for example, contact form error combinations) without writing throwaway debug pages or manually reproducing conditions.
- Existing test harnesses cover behaviour well, but they do not give a **direct, URL-based way** to load a particular state in the real app.
- We want a solution that is:
  - **Dev-only** (never affects production),
  - **Generic** enough to reuse beyond the contact form,
  - **Simple** to reason about and not another heavy catalogue to maintain.

## Goals

- Allow developers to open the real app (for example, `/en`) with a **URL-based scenario identifier** (for example, `?scenario=<id>#contact-form`) and have a target UI (for example, the contact form) load a predefined state **before first render**.
- Keep the mechanism **generic** so other features can opt in using their own target ids and scenario maps.
- Keep scenario definitions in **TypeScript**, so tests and dev UI can share them without duplicating state descriptions.
- Ensure the system is **no-op in production** and when no scenario is specified.

## Non-goals

- Do not build a full visual-regression system or a complete scenario catalogue in this epic.
- Do not force tests to source all data through scenarios; tests can still use explicit fixtures where that is clearer.
- Do not change existing routing or hash semantics beyond reading additional keys.

## Success criteria

- In development, when the URL looks like `/en?scenario=<id>#contact-form`, the contact form:
  - Detects the `scenario` id, looks it up in a TS scenario map, and
  - Prefills the form (or otherwise configures it) according to that scenario **before the user interacts**.
- The same scenario map can be imported in tests to drive high-level, named scenarios where useful, without being mandatory.
- The core parsing and scenario plumbing live in a **generic dev namespace** (for example, `src/dev/scenarios/`) and can be reused by other features with minimal wiring.
- In production builds:
  - Scenario parsing and application are effectively disabled or compiled out.
  - Normal behaviour is unchanged when no scenario id is provided.
