# Primer — formBlockTests (Form-block test harness and coverage)

## Problem

The contact-form blocks (name, email, message, Turnstile, honeypot) now expose a shared contract via the form-blocks context and produce structured validation results. However, there are no dedicated tests that:

- Exercise the shared form-blocks contract per block.
- Verify block-specific validation behaviour and inline UX (labels, hints, live validation).
- Guard the interaction between the blocks and the surrounding infrastructure (form-blocks and message centre).

This makes the contract fragile: regressions in validation, payload, or live-validation behaviour would be hard to catch.

## Goals

- Introduce a reusable test harness for form blocks that:
  - Mounts a block under a `FormBlocksProvider`-compatible context.
  - Captures the block’s registration (key, validate, getValue, focus, liveValidation, etc.).
  - Lets tests drive both DOM interactions (typing, blurring, disabling) and contract methods.
- For each contact block (name, email, message, Turnstile, honeypot), define clear test success criteria that cover:
  - Contract-level behaviour (validation result, payload, focus hooks).
  - User-facing behaviour (inline errors, helper text, ARIA attributes, live validation).
- Keep tests focused on the block contract and UX, not on the full `ContactForm` orchestration.

## Non-goals

- Do not test the full submit/triage/message-centre pipeline in this epic (that belongs in the contactForm.form stories and success files).
- Do not cover server behaviour (API route and server-side guards) here.
- Do not introduce cross-block integration tests beyond what is needed to validate the harness itself.
- Do not exercise localization or dynamic translation in these tests; use the
  English (`en`) form copy only and treat locale plumbing as out of scope.

## Success criteria

- A shared harness exists for form-block tests and is described in
  `success/formBlockTests.harness.success.md`.
- Each block has a dedicated success file under `success/` that lists:
  - The contract aspects to test.
  - The validation and UX scenarios to cover.
  - The expected results for each scenario.
- Tests based on this epic can:
  - Recreate and assert the structured validation results produced by each block.
  - Verify that live validation behaves as specified (blur + continuousValidation).
  - Confirm that block contracts stay aligned with the `ContactFormBlock*` types and the
    form-blocks registration API.
