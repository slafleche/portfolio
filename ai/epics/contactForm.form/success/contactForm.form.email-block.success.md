# Success — Email block

This file describes success criteria for the `EmailBlock` component.

## Responsibilities

- Render an email input with proper labeling, required indicators, and autocomplete hints driven by locale copy.
- Manage its own value and validation using shared email validation helpers.
- Register with the form-blocks and message-centre infrastructure so orchestration is centralized in the shell, not in the block.

## Validation and messaging

- The block uses shared email validation helpers to check format and emptiness; implementation details stay inside validation modules and the block.
- When validation fails, the block:
  - Shows a concise inline error attached to the control (for example, “Email invalid”).
  - Produces a structured validation result whose messages:
    - Have `type: 'error'`.
    - Use an internal `code` for the email-specific failure.
    - Provide `text` with the user-facing message.
    - Set `scrollTarget` so the email field can be scrolled into view and focused when chosen as the priority message.
- When valid, the block clears its inline error and returns an empty error-message list in its validation result.

## Form-blocks contract

- The block registers under a stable key (for example, `"email"`) with the form-blocks context.
- The registration includes:
  - A `focus` function that places focus/cursor on the email control.
  - A `getValue` accessor used when constructing the contact form payload.
  - A `validate` function that returns a boolean validity result.
- The block does not know about toasts or global banners; it only exposes validation/payload hooks and leaves message construction and presentation to shared infrastructure.
