# Success — formBlockTests — Name block

This file describes success criteria for tests covering the `NameBlock` component.

## Contract tests

- Registration:
  - Registers under key `"name"`.
  - `getValue()` returns the current input value.
  - `validate()` returns `false` for invalid values and `true` for valid ones.
  - `focus()` moves focus to the name input.
  - `liveValidation` on the registration is:
    - `false` on initial render.
    - `true` after the field has been blurred at least once.
- Structured validation:
  - For an empty or too-short value, the block's structured validation result (from its internal contract) is a `ContactFormBlockValidationResult` with:
    - `valid: false`.
    - A single `messages[0]` entry with:
      - `type: 'error'`.
      - `code: 'form-error-name-required'`.
      - `text` matching `copy.errors.required`.
      - `scrollTarget` equal to the block id.
  - For a too-long value, the structured validation result has:
    - `valid: false`.
    - A single `messages[0]` entry with:
      - `code: 'form-error-name-too_long'`.
      - `text` matching `copy.errors.tooLong`.
  - For a valid value, the structured validation result has:
    - `valid: true`.
    - `messages` is an empty array.

## UX and live-validation tests

- Label and required indicator:
  - The rendered `<label>` text matches `copy.label` and is associated with the input via `htmlFor`/`id`.
  - When `required` is true, the required indicator text matches `copy.requiredText` and is rendered alongside the label.
- Inline error:
  - Before blur and with `continuousValidation` disabled:
    - Typing an invalid name does not show an inline error under the field.
  - After the first blur with an invalid name:
    - The field shows the correct inline error text:
      - “required” for empty/too-short input.
      - “too long” for overly long input.
  - When the name becomes valid and `continuousValidation` is enabled:
    - The inline error clears as the user fixes the value.
- Focus choreography:
  - When the block is rendered between two simple focusable controls (for example, a “previous” and a “next” control):
    - Calling the registration’s `focus()` moves focus to the NameBlock input.
  - These focus behaviours work whether the field is currently valid or showing an inline error.
- Required and disabled:
  - When `required` is true (the default), the control is marked as required in the UI (required indicator and underlying `required` attribute).
  - When `disabled` is true, typing does not change the value or introduce new inline error state.
- ARIA:
  - When an inline error is shown, the input has `aria-invalid="true"` and the hint id is used in `aria-describedby`.

## Test harness and cleanup notes

- Once the shared block test harness is implemented (see `formBlockTests.testHelpers.harness`):
  - NameBlock tests should use the harness helpers (for example, `registration` / `getNameContract()`) instead of spying on `useFormBlock` to access the registration or contract.
  - Any interim spies on `useFormBlock` in `NameBlock` tests should be removed in favour of the harness-based accessors to keep tests clearer and less coupled to hook internals.
