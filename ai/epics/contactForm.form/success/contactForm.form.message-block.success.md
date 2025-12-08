# Success — Message block

This file describes success criteria for the `MessageBlock` (free-text message) component.

## Responsibilities

- Render a multi-line textarea for the visitor’s message, with appropriate labeling, required indicators, and helper text driven by locale copy.
- Manage its own value, auto-resize behaviours, and validation using shared message validation helpers (length, URL count, etc.).
- Register with form-blocks and message-centre infrastructure so orchestration and messaging remain centralized.

## Validation and messaging

- The block uses shared helpers to:
  - Enforce minimum and maximum character counts.
  - Clamp length safely.
  - Count URLs and enforce URL limits.
- The block surfaces:
  - A character counter and any link-usage hints as helper text.
  - Inline error hints when the message is too short, too long, has too many links, or is missing.
- When validation fails, the block’s structured validation result includes a message with:
  - `type: 'error'`.
  - A stable `code` for the specific failure reason.
  - `text` matching the user-facing error.
  - A `scrollTarget` that allows the message field to be scrolled into view and focused as a priority error.
- When validation passes, the block includes no error-type messages and may include informational messages in its validation result if needed for the message centre.

## Form-blocks contract

- The block registers under a stable key (for example, `"message"`) with the form-blocks context.
- The registration provides:
  - A `focus` function that moves focus into the textarea and positions the cursor appropriately.
  - A `getValue` accessor for payload construction.
  - A `validate` function returning a boolean validity signal aligned with the error messages it emits.
- The block does not rely on form-level error flags; it responds only to coarse read-only/disabled states passed from the shell.
