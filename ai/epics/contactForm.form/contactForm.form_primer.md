# Primer — contactForm.form (Contact form shell)

## Problem

The contact form component currently carries too much responsibility. It knows
about specific fields, manages field-level validation and error mapping, owns
continuous-validation flags, and embeds widget behaviour (like Turnstile) and
status messaging. This makes it hard to reason about, hard to reuse in other
surfaces (such as debug pages), and tightly couples layout, validation, and
copy.

We want the contact form to behave as a thin orchestration shell: it should
render blocks, trigger validation and submission, and let blocks plus shared
infrastructure handle everything else.

## Goals

- Keep the contact form “dumb” about fields:
  - The form knows it renders blocks, not that those blocks correspond to
    “name”, “email”, or “message”.
  - Field-specific validation and messages live in blocks and shared helpers.
- Centralise orchestration:
  - On submit, the form triggers a single validation pass across all registered
    blocks and receives only “all valid” vs “some block invalid”.
  - When valid, the form can request a combined payload assembled from all
    blocks and hand it to the submit logic.
- Isolate messaging:
  - The form has no knowledge of per-field or global messages; blocks talk to
    the message-centre layer directly.
  - The form only exposes coarse submission status (e.g., “submitting”, “idle”,
    and high-level success/failure) for the rest of the tree to react to.
- Make the form reusable:
  - The same shell should work in the real dialog, in a debug page, and in
    tests, with minimal special cases.

## Non-goals

- Do not move block-level logic (validation, error text, counters, Turnstile
  behaviour) into the form.
- Do not teach the form about individual validation reasons or message strings.
- Do not decide inline vs toast presentation in the form; that belongs to the
  message-centre + presentation layer.

## Success criteria

- The `ContactForm` component:
  - Renders the form structure and blocks, but has no field-specific logic.
  - Owns only coarse-grained submission state (`isSubmitting` and a simple
    submit status).
  - Interacts with blocks through a small, shared “form-blocks” API to:
    - Trigger validation across all blocks.
    - Collect a combined payload when validation passes.
- Blocks:
  - Self-identify and manage their own validation and messaging, without the
    form needing to know their internal details.
  - Respond to `isSubmitting` for disabling, but do not rely on form-level
    error flags.
- Message-centre:
  - Receives all of its data from blocks and shared infrastructure, not from
    the form component.

## Stories

- Error handling and messaging: see `stories/contactForm.form.story.error-messaging.md` for the detailed user story covering message triage, priority selection, toasts, and scroll/focus recovery behaviour when submissions fail.
