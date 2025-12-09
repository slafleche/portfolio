# Success — formBlockTests — Email block

This file describes success criteria for tests covering the `EmailBlock` component.

## Contract tests

- Registration:
  - Registers under key `"email"`.
  - `getValue()` returns the current email string.
  - `validate()` returns `false` for empty/invalid emails and `true` for valid emails.
  - `focus()` moves focus to the email input.
  - `liveValidation` on the registration is:
    - `false` on initial render.
    - `true` after the field has been blurred at least once.
- Structured validation:
  - For an empty string or syntactically invalid email, the block's structured validation result (from its internal contract) is a `ContactFormBlockValidationResult` with:
    - `valid: false`.
    - A single `messages[0]` entry with:
      - `type: 'error'`.
      - `code: 'form-error-email-invalid'`.
      - `text` matching `copy.errors.invalid`.
      - `scrollTarget` equal to the block id.
  - For a valid email address, the structured validation result has:
    - `valid: true`.
    - `messages` as an empty array.

## UX and live-validation tests

- Label, required indicator, and autocomplete:
  - Using test copy from the locale fixtures helpers (for example, `buildTestEmailBlockLocale()`), the rendered `<label>` text matches `copy.label` and is associated with the input via `htmlFor`/`id`.
  - The required indicator text uses `copy.requiredText` and appears alongside the label.
  - The email input uses `type="email"` and `autoComplete="email"` so browsers can provide appropriate keyboard/UI hints.
- Keyboard focus corridor:
  - When `EmailBlock` is rendered between two simple focusable controls (for example, using `FocusSentinelWrapper` with “before” and “after” inputs):
    - Tabbing forward from the “before” control moves focus into the email input.
    - Tabbing forward again moves focus to the “after” control.
    - Shift+Tab reverses that order.
- Inline error:
  - Before blur and with `continuousValidation` disabled:
    - Typing an invalid email does not show the inline error.
  - After blur with an invalid email:
    - The inline error “invalid email” is shown using `copy.errors.invalid`.
  - With `continuousValidation` enabled and an invalid email:
    - The inline error updates live as the user edits.
  - Once a valid email is entered with `continuousValidation` enabled:
    - The inline error disappears.
- Required and disabled/read-only:
  - The email control is always marked required in the UI (required indicator and underlying `required` attribute).
  - When `disabled` is true, typing does not change the value or introduce new inline error state.
  - When `readOnly` is true, the control does not update its value and continues to reflect existing validation state without new errors being created.
- ARIA:
  - When an inline error is shown, the email input has `aria-invalid="true"` and the error hint id is referenced by `aria-describedby`.
