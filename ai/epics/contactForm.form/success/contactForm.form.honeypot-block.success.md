# Success — Honeypot block

This file describes success criteria for the `HoneypotBlock` component.

## Responsibilities

- Provide a hidden honeypot input that is invisible and inert for real users but likely to be filled by automated bots.
- Ensure the honeypot does not interfere with screen readers or keyboard navigation.
- Participate in payload construction so server-side guards can treat a filled honeypot as a silent block condition.

## Behaviour and messaging

- The honeypot input is:
  - Hidden from visual layout (for example, via visually-hidden styles).
  - Removed from normal focus order (for example, `tabIndex={-1}`).
  - Clearly labeled in markup but not announced in the primary interaction flow.
- The block does not display inline helper or error messages to real users.
- When the honeypot is filled, the server treats the submission as blocked but responds in a way that mimics success for the user; any messaging about blocking is handled on the server/message-centre side, not in the honeypot block itself.

## Form-blocks and payload

- The block either:
  - Registers with form-blocks as a simple value contributor, or
  - Exposes its value purely through inclusion in the form payload (for example, via a hidden input).
- The honeypot does not participate in client-side validation or error triage and does not emit `MessageCentreTransmission` data.
- Success is measured by:
  - Real users never encountering the honeypot in normal interaction.
  - Honeypot data flowing reliably to the server for guard logic.

