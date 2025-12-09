# Success — formBlockTests — Turnstile block

This file describes success criteria for tests covering the `TurnstileBlock` component.

## Contract tests

- Registration:
  - Registers under key `"turnstile"`.
  - `getValue()` returns the current token string (empty when missing, and a default/mock token when bypassed in debug environments).
  - `validate()` returns:
    - `true` when status is `verified` or `bypassed`.
    - `false` when status is `loading`, `ready`, `expired`, or `error`.
  - Tests may ignore the `liveValidation` flag on the registration for this block; Turnstile’s inline guidance is always visible while status is not in a completed state.
- Structured validation:
  - For `status: 'verified'` or `'bypassed'`, `validate()` yields:
    - `valid: true`.
    - `messages` is an empty array.
  - For `status: 'expired'`, `validate()` yields:
    - `valid: false`.
    - A single error message with:
      - `code: 'turnstile.expired'`.
      - `text` matching `copy.summary.expired`.
      - `scrollTarget` equal to the block id.
  - For `status: 'error'`, `validate()` yields a corresponding `turnstile.error` message and `copy.summary.error`.
  - For all other non-completed statuses, `validate()` yields a `turnstile.missing` message with `copy.summary.missing`.

## UX tests

- Wiring and state representation:
  - The wrapper `div` uses the provided `id` and `data-order` attributes.
  - The wrapper `div` exposes `data-state` reflecting the current Turnstile status and `data-disabled` when the block is disabled.
  - The widget container is present, and a hidden `input[name="token"]` carries the current token string.
- Inline status:
  - When status is `expired` or `error`, the inline status paragraph shows the correct localized summary.
  - When status is `bypassed`, a preview placeholder is shown instead of the live widget for debug environments.
- Payload:
  - When verified, the hidden `input[name="token"]` contains the expected token value.
  - When not verified, the hidden token input is empty (or contains only the mock/default token in bypassed environments).
- Disabled and error handling:
  - When the block is rendered with `disabled` set, pointer interaction with the Turnstile container is prevented (clicks do not change status or token).
  - When the Turnstile widget cannot be mounted (for example, the script fails to load or the widget throws during render), the block transitions to an `error` state, shows the corresponding summary message, and structured validation uses the `turnstile.error` code and copy.
