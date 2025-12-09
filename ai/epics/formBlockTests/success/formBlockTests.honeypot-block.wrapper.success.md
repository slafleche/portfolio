# Success — formBlockTests — Honeypot block wrapper

This file describes how tests should mount the `HoneypotBlock` component and
verify that it behaves correctly *outside* the normal form-block and focus
flows.

## Context and provider

- `HoneypotBlock` does **not** use the form-blocks context and is not
  registered via `useFormBlock`.
- Tests render it directly, without a `FormBlocksProvider`.
- When payload behaviour is under test, `HoneypotBlock` is rendered inside a
  simple test `<form>` element.

## Props supplied to `HoneypotBlock`

- Required props:
  - `copy`: real English (`en`) honeypot locale with:
    - `label` for the hidden field.
- Optional props:
  - `name`: defaults to `"hp"`; tests override this only when asserting the
    submitted field name.

## Structure and payload usage

- Structure/ARIA tests:
  - Render `HoneypotBlock` with test copy and assert:
    - The wrapper has `aria-hidden` and uses visually hidden styles.
    - The `<label>` text matches `copy.label` and is associated with the
      `<input>` via `htmlFor`/`id`.
    - The input has `tabIndex={-1}` and `autoComplete="off"`.
- Payload tests:
  - Render `HoneypotBlock` inside a test `<form>`.
  - Programmatically set a value on the honeypot input.
  - Submit the form and assert that the submitted data includes the honeypot
    value under the expected `name` (default `"hp"` or an override).

## Focus behaviour (negative tests)

- Honeypot is intentionally **not** part of the main focus order:
  - Tests render a simple focus corridor:
    - A focusable control **before** the honeypot (for example, a visible
      button or text input).
    - The `HoneypotBlock`.
    - A focusable control **after** the honeypot.
  - Using keyboard navigation (for example `Tab` and `Shift+Tab`), tests:
    - Move focus from the first control to the second control and assert that
      `document.activeElement` is never the honeypot input.
    - Move focus back from the second control to the first and again assert
      that the honeypot input never receives focus.
- No `FocusSentinelWrapper` or form-block focus helpers are involved; the
  honeypot must remain invisible to the primary focus flow.

## Locale assumptions

- Tests use English (`en`) honeypot copy only.
- Locale plumbing and translation correctness are covered elsewhere and are
  out of scope for this wrapper spec.

