# Success — Prototype block contract

This file describes success criteria for the generic contact form block contract. Individual blocks (name, email, message, Turnstile, etc.) specialise this prototype but share the same interface and orchestration expectations.

## Common responsibilities

- Each block is responsible for:
  - Rendering its own UI (label, control, helper/error text) using localized copy passed via props.
  - Owning its own value and validation logic, delegated to shared helpers where appropriate.
  - Emitting field-level messages describing its state without deciding how those messages are presented (inline vs toast).
- Blocks do not:
  - Know about the overall submit lifecycle beyond coarse `isSubmitting`/read-only/disabled state.
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

- Blocks emit messages via a `MessageCentreTransmission` structure with:
  - `source`: usually the block key, so messages can be grouped and ordered.
  - `messages`: an array of `Message` objects describing field-level state.
- Each `Message` produced by a block follows this pattern:
  - `type`: `'error' | 'warning' | 'info'`, chosen to reflect severity.
  - `code`: a stable internal identifier for the specific message scenario.
  - `text`: the user-facing, localized message string.
  - `categoryError`: a higher-order category (for example, a shared “invalid input” bucket for field validation failures, or a “verification” category for Turnstile errors).
  - Optional `scrollTarget`: an identifier that allows the shell to scroll this block into view and focus it when the message is selected as the priority error.
- Success criteria for messaging:
  - For any invalid state, the block emits at most one `error`-type `Message` at a time per source, keeping the bundle concise.
  - When the block returns to a valid state, it stops emitting error-type messages for that condition.
  - Blocks never emit toasts directly; they only publish `Message` objects that the message-centre layer can triage and present.

## Props and external state

- Blocks accept only the props they need for:
  - Localized copy.
  - Coarse form state (for example, `readOnly`, `disabled`, and `isSubmitting`).
  - Optional debug and preview modes.
- Blocks remain reusable in different surfaces (dialog, debug page, tests) as long as:
  - The form-blocks and message-centre providers are present.
  - The same contract and message shapes are respected.

