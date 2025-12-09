# Success — formBlockTests — Message block

This file describes success criteria for tests covering the `MessageBlock` component.

## Contract tests

- Registration:
  - Registers under key `"message"`.
  - `getValue()` returns the current textarea value.
  - `validate()` returns `false` for invalid messages and `true` for valid messages, in line with the shared validation helper.
  - `liveValidation` on the registration is:
    - `false` on initial render.
    - `true` after the field has been blurred at least once.
- Structured validation:
  - For each invalid reason from `evaluateMessageField`, the block's structured validation result (from its internal contract) is a `ContactFormBlockValidationResult` with:
    - `valid: false`.
    - A single error message whose `code` and `text` are:
      - `empty` → `code: 'form-error-message-required'`, `text` matching `copy.errors.required`.
      - `too_short` → `code: 'form-error-message-too_short'`, `text` matching `copy.errors.tooShort`.
      - `too_long` → `code: 'form-error-message-too_long'`, `text` matching `copy.errors.tooLong`.
      - `too_many_links` → `code: 'form-error-message-too_many_links'`, `text` matching `copy.errors.tooManyLinks`.
  - For a valid message (length and URL usage within limits), the structured validation result has:
    - `valid: true`.
    - `messages` as an empty array.

## UX and live-validation tests

- Label, required indicator, and helpers:
  - Using test copy from the locale fixtures helpers (for example, `buildTestMessageBlockLocale()`), the rendered `<label>` text matches `copy.label` and is associated with the textarea via `htmlFor`/`id`.
  - The required indicator text uses `copy.requiredText` and appears alongside the label.
  - The character counter reflects remaining characters and shows the “max characters” message at the limit.
  - The character counter reflects remaining characters and shows the “max characters” message at the limit.
  - URL usage hints appear only when URLs are present, with the correct text when the limit is reached.
- Keyboard focus corridor:
  - When `MessageBlock` is rendered between two simple focusable controls (for example, using `FocusSentinelWrapper` with “before” and “after” inputs):
    - Tabbing forward from the “before” control moves focus into the message textarea.
    - Tabbing forward again moves focus to the “after” control.
    - Shift+Tab reverses that order.
- Inline errors:
  - Before blur and with `continuousValidation` disabled:
    - Invalid values do not show inline error text.
  - After blur:
    - Each invalid reason produces the expected inline error copy under the field.
  - With `continuousValidation` enabled:
    - Errors update live as the user edits.
    - Once the message is valid, the inline error is cleared while helper/counter text remains.
- Disabled/read-only:
  - When `disabled` is true, typing does not change the value or introduce new inline error state.
  - When `readOnly` is true, the control does not update its value and continues to reflect any existing validation state without creating new errors.
- ARIA:
  - When an inline error is present, `aria-invalid="true"` is set and the primary hint’s id is included in `aria-describedby`.
