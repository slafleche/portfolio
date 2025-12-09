# Success — Form-block test harness

This file describes success criteria for the shared test harness used to exercise contact-form blocks.

## Responsibilities

- Provide a minimal but realistic environment for block tests by:
  - Rendering blocks inside a provider compatible with `FormBlocksProvider` (or the real provider where appropriate).
  - Capturing the `FormBlockRegistration` for the block under test so tests can call its contract methods.
  - Supplying representative locale copy to blocks (e.g., via locale builders or stable test fixtures).

## Harness shape

- The harness exports helpers such as:
  - `renderBlockWithFormBlocks(<BlockComponent>, props)` that:
    - Mounts the block inside a form-blocks context.
    - Returns:
      - The testing-library `screen`/queries or equivalent for DOM assertions.
      - The latest `FormBlockRegistration` object registered by the block.
  - An optional helper to simulate `continuousValidation` being enabled in the provider.
- The harness must:
  - Ensure only one registration per block key is active at a time.
  - Allow tests to call `registration.validate()`, `registration.getValue()`, `registration.focus()`, and inspect `registration.liveValidation`.

## Success criteria

- Tests can, via the harness:
  - Drive DOM interactions (typing, blur, toggling `disabled`) and see the block’s inline UX update.
  - Invoke contract methods and assert on validation results and payloads.
- The harness is block-agnostic: it can be reused for Name, Email, Message, Turnstile, and Honeypot blocks without special casing beyond props and locale copy.

