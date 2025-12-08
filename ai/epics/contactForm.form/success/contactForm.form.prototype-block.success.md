# Success — Prototype block contract

This file describes success criteria for the generic contact form block contract. Individual blocks (name, email, message, Turnstile, etc.) specialise this prototype but share the same interface and orchestration expectations.

## Common responsibilities

- Each block is responsible for:
  - Rendering its own UI (label, control, helper/error text) using localized copy passed via props.
  - Owning its own value and validation logic, delegated to shared helpers where appropriate.
  - Producing structured validation results that include field-level messages describing its state, without deciding how those messages are presented (inline vs toast).
- Blocks do not:
  - Know about the overall submit lifecycle beyond coarse read-only/disabled state.
  - Inspect or set global form-level error flags.
  - Decide how or when to show toasts; they only publish messages.

## Form-blocks interface

- Every block registers with the form-blocks context under a unique, stable key (for example, `"name"`, `"email"`, `"message"`, `"turnstile"`).
- The registration exposes a standard contract, which includes:
  - `key`: the block identifier used for ordering and message grouping.
  - `focus(): void` — moves focus to the primary interactive element and, where appropriate, positions the cursor (for example, at the end of the current value).
  - `getValue(): unknown` — returns the block’s current value in a shape suitable for payload construction.
  - `validate(): boolean` — runs the block’s validation and returns a simple validity result (`true` when valid).
  - Optional helpers such as:
    - `getValidationSummary(): string | null` — a concise summary of the current error, if any.
    - `requestFocusBefore(): void` and `requestFocusAfter(): void` — hooks used for focus choreography between neighbouring blocks.
- Blocks treat the form-blocks API as their only contract to the shell for validation and payload; they do not reach into the shell’s state directly.

## Message-centre interface

- Blocks do not talk to the message centre directly.
- Each block’s validation result includes message objects that describe its field-level state:
  - `type`: `'error' | 'warning' | 'info'`, chosen to reflect severity.
  - `code`: a stable internal identifier for the specific message scenario.
  - `text`: the user-facing, localized message string.
  - Optional `scrollTarget`: an identifier that allows the shell or recovery helpers to scroll this block into view and focus it when the message is selected as the priority error.
- On submission attempts, an orchestration helper collects validation output from all blocks, attaches a higher-order summary string for the selected error category (for example, “required input”, “invalid input”, “submission error”), and wraps the result into message-centre transmissions consumed by the message-centre layer.
- Success criteria for messaging:
  - For any invalid state, a block’s validation result includes at most one `error`-type message at a time per source, keeping the bundle concise.
  - When the block returns to a valid state, it stops producing error-type messages for that condition.
  - Blocks never request toasts directly; they only produce messages that the message-centre/triage layer can combine, prioritise, and present.

## Props and external state

- Blocks accept only the props they need for:
  - Localized copy.
  - Coarse form state (for example, `readOnly` and `disabled`).
  - Optional debug and preview modes.
- Blocks remain reusable in different surfaces (dialog, debug page, tests) as long as:
  - The form-blocks and message-centre providers are present.
  - The same contract and message shapes are respected.
