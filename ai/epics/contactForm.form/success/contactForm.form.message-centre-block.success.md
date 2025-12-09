# Success — Message centre

This file describes success criteria for the message centre layer and its primary UI block.

## Responsibilities

- Receive message-centre transmissions produced by submit/triage helpers (using validation output from the form shell and its blocks) and turn them into a coherent view of what is happening with the form (errors, warnings, informational states).
- Provide a single place where users can understand the current status of their submission and any issues they need to address.
- Decide how messages are presented (inline, summary, toast) without requiring blocks or the `ContactForm` shell to know about presentation details.

## Message model and triage

- The message centre treats each inbound transmission as:
  - `source`: a label identifying where the messages came from (for example, `"global"` or a block key).
  - `messages`: an array of message objects, each with:
    - `type`: `'catastrophic' | 'error' | 'warning' | 'info'`.
    - `code`: a stable internal identifier.
    - `text`: the user-facing message.
    - catastrophic meaning can't send messges (no human verifiation)
      - if catastroic is found, ignore everything else and just send that to the message centre
        - trigger toaster and scroll to message centre, disabled form.
    - A higher-order summary string derived from the error category (for example, “required input”, “invalid input”, “submission error”) that is already localized; the message centre does not call translation itself.
    - Optional `scrollTarget` describing where scroll/focus recovery should land.
- On each submission attempt, the message centre (or a closely related helper) runs a triage pass across all messages to select a single priority message by:
  - Severity (`error` before `warning`, `warning` before `info`).
  - Then by logical field order when severities are equal.
- The triage result is stored alongside the full bundle and made available to both:
  - The message-centre UI (for toasts and summaries).
  - The form shell’s recovery protocol (for scroll/focus behaviour), via metadata only.

## Presentation and toasts

- The message centre renders summaries and inline status using the full bundle of messages; individual blocks can also show their own inline hints.
- Toast behaviour is driven only by the triage result:
  - At most one toast is surfaced per submission.
  - Toast content is derived from the priority message’s higher-order summary (a global category-level message), not by enumerating every field-level error.
- Blocks never request toasts directly and do not know whether a toast was shown; they only publish messages.

## Accessibility and recovery

- Error and status announcements are exposed via appropriate live regions (for example, `role="status"` or `role="alert"` where warranted).
- The message centre does not take focus away from critical controls unless a higher-level flow (for example, after submission) explicitly moves focus to a summary area.
- The metadata from the priority message (for example, `scrollTarget`) is sufficient for the form shell to:
  - Scroll the relevant field or region into view.
  - Trigger the block’s focus behaviour so the user can start fixing issues immediately.
