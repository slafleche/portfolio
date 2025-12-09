# Success — ContactFormOutcome

This file describes success criteria for the `ContactFormOutcome` layer
(hook/context), which interprets validation and submission results into
user-facing outcomes and message-centre data.

## Blocking

We need a scroll helper so we can query the scroll location while working on the
scroll to targets in the form (or any other component, make it a generic test
component)

## Responsibilities

- Consume:
  - Coarse submit state and validation results from `ContactFormFlow`.
  - Structured block-level messages (including `type`, `code`, `text`, optional
    `scrollTarget`).
- Produce:
  - Flattened message-centre data for `MessageCentreBlock`:
    - `globals`: inline form-level summaries (strings only).
    - `blocks`: inline per-block summaries (strings only).
    - `toastFallback`: an optional higher-order summary string used as toast
      content when appropriate.
  - A single “priority message” object that expresses:
    - Which message should drive recovery (field-level or catastrophic).
    - Its `scrollTarget` (if applicable).
    - Whether it represents a catastrophic condition (for example, human
      verification unavailable).
- Provide simple hints to the shell about how to react:
  - Whether the form should be considered in a catastrophic state (disable
    everything and scroll to the message centre).
  - Whether there are any error-type messages remaining (for invalid flag
    management).

## Inputs

`ContactFormOutcome` expects:

- From `ContactFormFlow`:
  - `submitStatus`
    (`'idle' | 'success' | 'validation_error' | 'rate_limited' | 'service_unavailable' | 'blocked' | 'generic_error' | …`).
  - `latestValidationResults: ContactFormBlockValidationResult[]`:
    - Each result includes `id`, `valid`, and a `messages: MessageBase[]` array
      (with `type`, `code`, `text`, optional `scrollTarget`).
- Optional configuration:
  - Category-to-summary mappings that translate internal categories (for
    example, required input, invalid input, submission error) into pre-localised
    higher-order summary strings.
  - A stable block order (for example, name → email → message → turnstile) used
    when breaking ties between messages of the same severity.

## Outputs / API

A typical `useContactFormOutcome` hook exposes:

- `messagesForUi: MessageCentreMessages`:
  - `globals: string[]` — form-level summaries to show inline (for example,
    “Please fix the errors below” or rate-limit messages).
  - `blocks: string[]` — concise, per-block error summaries, derived from block
    message `text` values.
  - `toastFallback?: string` — a single higher-order summary string for the
    toast (for example, “Some details are missing”, “Submission failed, please
    try again later”), or `undefined` when no toast should be shown.
- `priority`:
  - `message: { type: 'catastrophic' | 'error' | 'warning' | 'info'; text: string; scrollTarget?: string } | null`
    — the message that should drive recovery.
  - `higherOrderSummary?: string` — the higher-order, already-localised summary
    associated with the priority message (used to drive the toast).
  - `isCatastrophic: boolean` — `true` when the priority message represents a
    submission-blocking condition (for example, verification cannot be loaded).
- Derived flags:
  - `hasErrors: boolean` — `true` when any error-type messages are present.
  - `isCatastrophic: boolean` — mirrored from `priority.isCatastrophic`,
    convenient for the shell to decide whether to disable the form and scroll to
    the message centre.

## Message selection rules

`ContactFormOutcome` applies consistent rules when choosing a priority message
and building `messagesForUi`:

- Severity ordering:
  - Catastrophic messages take precedence over all others.
  - Otherwise, error messages outrank warnings, which outrank informational
    messages.
- Field-order tie-breaking:
  - When multiple messages share the same severity, the priority message is
    selected by a stable logical order of sources (for example, name → email →
    message → turnstile) or by form-level/global vs block-level rules as agreed
    in the shell spec.
- Toast derivation:
  - At most one toast per submission attempt.
  - Toast content is always derived from a higher-order summary string
    associated with the priority message’s category; `ContactFormOutcome` does
    not synthesize or translate copy, it only chooses between pre-localised
    strings provided by configuration.
- Inline summaries:
  - `globals` and `blocks` arrays are built from message `text` strings and any
    configured form-level summaries (for example, rate-limit messages) without
    duplicating the full field-level error list.
  - The outcome layer does not decide how the `MessageCentreBlock` visually
    orders globals vs blocks; it only provides the raw arrays.

## Behavioural constraints

- Does not:
  - Modify or translate message text; all strings are treated as pre-localised.
  - Reach into the DOM or perform scroll/focus operations directly.
  - Know about specific block implementations; it operates solely on message
    metadata and configured block ordering.
- Must:
  - Operate purely in terms of data (no side effects), so it can be tested with
    synthetic validation results and submit statuses.
  - Keep its API stable so `ContactForm` can be tested with fake blocks and
    simulated outcomes, without depending on specific
    Name/Email/Message/Turnstile behaviour.
