# Success — Turnstile block

This file describes success criteria for the `TurnstileBlock` (human verification) component.

## Responsibilities

- Integrate Cloudflare Turnstile (or equivalent) as a human verification step without leaking implementation details into the `ContactForm` shell.
- Manage its own widget lifecycle, token state, and local status (for example, loading, ready, verified, expired, error, bypassed).
- Register with form-blocks and message-centre infrastructure so the shell can treat verification as just another block in validation and payload assembly.

## Validation and messaging

- The block:
  - Requests and maintains a verification token when the widget is available.
  - Exposes a simple validity result based on its status (for example, verified or bypassed is valid; missing/expired/error is invalid).
- When invalid, the block:
  - Shows appropriate inline helper/error text under the widget (“Complete the human verification”, “Verification expired”, etc.).
  - Publishes a `MessageCentreTransmission` with a `Message` that:
    - Uses `type: 'error'` for missing/expired/error states.
    - Has a `code` that identifies the verification failure.
    - Provides `text` with the user-facing message.
    - Uses a `categoryError` that may differ from generic field validation (for example, “verification” vs “invalid input”) while still fitting the message-centre model.
    - Provides a `scrollTarget` so the verification area can be scrolled into view and focused when selected as the priority message.
- When valid or bypassed, the block does not emit error-type messages and ensures any hidden token input is up to date for payload construction.

## Form-blocks contract

- The block registers under a stable key (for example, `"turnstile"`) with the form-blocks context.
- The registration exposes:
  - A `getValue` accessor that returns the current token (or an empty string when absent).
  - A `validate` function that returns a boolean validity signal consistent with the block’s status.
  - (Optionally) a `focus` function that directs focus to the widget container or an appropriate control when needed for recovery flows.
- The block remains self-contained: the shell sees only coarse validity and token payload, not Turnstile-specific error codes or messages.

