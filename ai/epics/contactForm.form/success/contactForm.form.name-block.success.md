# Success — Name block

This file describes success criteria for the `NameBlock` component.

## Responsibilities

- Render a single-line text input for the visitor’s name, with clear labeling and required indicators driven by locale copy.
- Manage its own value and validation using shared contact-form validation helpers.
- Register with the form-blocks and message-centre infrastructure so the shell can orchestrate validation, payload collection, and messaging without knowing name-specific rules.

## Validation and messaging

- The block uses shared name validation helpers (for example, length limits and emptiness checks) to evaluate user input.
- Validation runs locally in the block and produces a simple “ok vs reason” result; all mapping from reasons to user-facing copy stays in the block.
- When validation fails, the block:
  - Surfaces a clear inline hint attached to the control (for example, “Name required”, “Name too long”).
  - Produces a structured validation result whose `messages` entries:
    - Use `type: 'error'` for invalid states.
    - Include a stable internal `code` for the specific failure.
    - Provide `text` containing the user-facing message.
    - Provide a `scrollTarget` that identifies the name control as the place to scroll and focus.
- When validation passes, the block clears its inline error state and returns an empty error-message list.

## Form-blocks contract

- The block registers itself with the form-blocks context under a stable key (for example, `"name"`).
- The registration exposes at least:
  - A `focus` function that moves focus to the name input (and places the cursor appropriately).
  - A `getValue` accessor for payload construction.
  - A `validate` function that returns a simple boolean validity signal for the form-blocks API.
  - Any hooks needed for continuous validation (for example, enabling live checks after the first submit).
- The block does not depend on form-level error flags; it responds only to shared read-only/disabled state passed from the shell.
