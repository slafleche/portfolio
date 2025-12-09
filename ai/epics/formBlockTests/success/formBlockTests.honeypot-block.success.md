# Success — formBlockTests — Honeypot block

This file describes success criteria for tests covering the `HoneypotBlock` component.

## Behaviour tests

- Wiring and accessibility:
  - Renders a visually hidden container that is removed from visual layout.
  - Contains a `<label>` with the honeypot copy and an associated `<input>` element.
  - The honeypot input:
    - Has `tabIndex={-1}` so it is not reachable via normal keyboard navigation.
    - Uses `autoComplete="off"` to avoid browser autofill.
  - The honeypot wrapper has `aria-hidden` so it is not announced in the primary interaction flow.
- Keyboard and focus behaviour:
  - When the honeypot is rendered between two simple focusable controls (for example, using `FocusSentinelWrapper` with “before” and “after” inputs):
    - Tabbing forward from the “before” control moves focus to the “after” control, skipping the honeypot input.
    - Shift+Tab reverses that order (after → before), still skipping the honeypot.

## Contract and payload tests

- The block does not register with the form-blocks context.
- When included inside a `<form>`, the honeypot input:
  - Contributes its value under the configured `name` (default `"hp"`).
  - Can be filled in tests to simulate bot behaviour; the rest of the client-side validation and messaging remains unchanged.
