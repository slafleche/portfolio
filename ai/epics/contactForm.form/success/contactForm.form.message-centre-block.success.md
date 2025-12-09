# Success — Message centre

This file describes success criteria for the message centre layer and its primary UI block.

## Responsibilities

- Receive message-centre transmissions produced by submit/triage helpers (using validation output from the form shell and its blocks) and turn them into a coherent view of what is happening with the form (errors, warnings, informational states).
- Provide a single place where users can understand the current status of their submission and any issues they need to address.
- Decide how messages are presented (inline, summary, toast) without requiring blocks or the `ContactForm` shell to know about presentation details.

## Message model and prioritisation

- The message centre UI is dumb: it never decides which message is most important and never filters messages; it only renders the bundle of messages and optional toast summary it is given.
- Upstream helpers work with structured transmissions and priority metadata; by the time data reaches the `MessageCentreBlock`, it has been flattened into:
  - A list or groups of already-localised message strings for inline display.
  - At most one already-localised higher-order summary string that may be used as toast text (for example, an “invalid form” summary derived from an error category).
- Message objects may still carry a `type: 'catastrophic' | 'error' | 'warning' | 'info'` so the UI layer (or its caller) can decide how to style or order them visually, but the block itself does not make behavioural decisions from these types.

## Presentation and toasts

- The message centre renders summaries and inline status using the full bundle of messages; individual blocks can also show their own inline hints.
- Toast behaviour is driven only by the triage result:
  - At most one toast is surfaced per submission.
  - Toast content is derived from the priority message’s higher-order summary (a global category-level message), not by enumerating every field-level error.
- Blocks never request toasts directly and do not know whether a toast was shown; they only publish messages.

## Accessibility and recovery

- Error and status announcements are exposed via appropriate live regions (for example, `role="status"` or `role="alert"` where warranted).
- The message centre does not take focus away from critical controls unless a higher-level flow (for example, after submission) explicitly moves focus to a summary area.
- The metadata from the priority message (for example, `scrollTarget`) is sufficient for the form shell to:
  - Scroll the relevant field or region into view.
  - Trigger the block’s focus behaviour so the user can start fixing issues immediately.

## Unit-test coverage — MessageCentreBlock UI

Unit tests in this epic cover only the `MessageCentreBlock` UI. Tests for priority selection, filtering, and scroll/focus behaviour live with the `ContactForm` shell success criteria.

### Rendering and accessibility

- No messages:
  - Given `globals: []`, `blocks: []` and no toast summary, the live-region shell is present but has no visual styling (no status text, no “visible” status wrapper, no toast).
  - The inline container (status wrapper) is either absent or marked with `data-visible="false"` so it is visually “off”.
- Messages appear:
  - When re-rendered with one or more messages, the inline container appears and uses the existing `statusWrapper` transition (for example via `data-visible="true"`), so the change is not visually jarring.
  - Inline content is exposed via a polite live region (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`).
- Messages clear:
  - When messages are removed again, the inline text disappears and the container returns to its non-visible state; any toast is also removed.

### Inline content shapes

Given the flattened `MessageCentreMessages` shape (`globals`, `blocks`, optional `toastFallback`), tests cover:

- Only globals:
  - A single global message → exactly one inline line with that string.
  - Multiple globals → all appear inline, in array order.
- Only block messages:
  - A single block message → exactly one inline line with that string.
  - Multiple block messages → all appear inline, in array order.
- Mixed globals and blocks:
  - Globals precede blocks inline: for example `globals: ['G']`, `blocks: ['B1', 'B2']` renders as `G`, `B1`, `B2`.
- All inline content is treated as already-localised; tests never look at codes or categories, only text presence and ordering.

### Toast behaviour and shapes

Toast tests focus on how `globals`, `blocks`, and `toastFallback` combine:

- No toast:
  - No messages at all (`globals` and `blocks` empty) → no toast.
  - Multiple block messages with no `toastFallback` and no globals → no toast.
- Global-driven toast:
  - When one or more globals are present, the toast (if any) uses the first global message as its text, regardless of blocks or `toastFallback`.
- Block-driven toast:
  - When there are no globals and exactly one block message, the toast uses that block message as its text.
- Fallback-driven toast:
  - When there are multiple block messages, no globals, and `toastFallback` is provided, the toast uses `toastFallback` as its text while all block messages remain inline.
- Toast lifecycle:
  - When the inputs change from a toast-producing shape to a non-toast shape, the toast markup disappears.
- Accessibility:
  - At most one toast is rendered at a time.
  - The toast content is exposed via an appropriate live region (for example, a container with `role="status"` or an equivalent ARIA pattern).

### No filtering in the block

- The component never drops messages on its own; any filtering or clustering happens upstream.
- Tests assert that, for a given `globals` and `blocks` array, all provided strings appear inline (subject only to the global-then-blocks ordering), and that the presence or absence of a toast matches the rules above.

All strings are treated as pre-translated; tests focus on presence, ordering, and accessibility surface, not on message semantics.

### Test harness

- A small harness in `tests/contact/helpers/messageCentre.harness.tsx` (`renderMessageCentre`) wraps `MessageCentreBlock` to keep tests focused and resilient to future wiring changes (for example, introducing a toast portal).
- The harness:
  - Calls RTL’s `render(<MessageCentreBlock messages={messages} />)` and returns the full render result.
  - Exposes `getInlineRegion()` to retrieve the main live-region element used for inline status.
  - Exposes `queryToastRegion()` and `getToastText()` to inspect the toast’s DOM and text content when present, without tests depending on internal layout details beyond the live-region semantics.
