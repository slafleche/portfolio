# helperAPI Epic — Primer (`#navigator`)

## Problem

The core style helpers (spacing → `paddings` / `margins`, `borders`, `backgrounds`, etc.) are becoming the backbone of layout and visual rules, but:


- There is no unified way for tooling (lint rules, codemods, future config UIs) to ask:
  - “What does this helper treat as its default behavior?”
  - “Is this override actually doing anything or just re-stating a default?”
- Lint guardrails focus on *where* certain properties appear (no raw padding/margin/border/background in styles) but cannot yet distinguish:
  - Legitimate overrides and app-specific intent, from
  - No-op restatements of defaults in non-token files, which are likely to drift or be sloppy.

As the helpers evolve toward a reusable library in the same org as `css-calipers`, this lack of an explicit default/config API will make reuse and enforcement harder, not easier.

## Goals

- Make helper defaults explicit, documented, and discoverable:
  - Spacing: clarify the built-in default behavior of `spacing` (and `paddings`/`margins`) and how axis shorthands (`all`, `vertical`, `horizontal`) are intended to be used.
  - Borders: clarify default width/style/color and radius semantics, and when helper callers should *omit* redundant values.
- Expose a small, stable API for helpers to report their own “default configuration”, without forcing an app-level config yet.
- Prepare a clean path for a future, overridable config layer (per app or per project) without breaking existing call sites.
- Enable lint/tooling to distinguish:
  - Token-level configuration and truth (where defaults may be defined or re-stated), from
  - Non-token code that accidentally re-specifies defaults or ignores helper shorthands.
- Keep the initial changes modest and focused on clarity and introspection, *not* a full-blown configuration system.

## Non-goals (for this epic)

- Do **not**:
  - Implement a full runtime configuration mechanism for helpers (no global config objects or factories yet).
  - Rewrite existing tokens to conform to a new default model, beyond small, clear wins.
  - Add heavy AST-based lint tooling; existing regex-based guardrails and light analysis are sufficient for this phase.
  - Change visual behavior of existing components/styles other than where necessary to align with already-intended helper semantics.

## Scope

- In scope:
  - Spacing helpers: `spacing`, `paddings`, `margins` and their axis-value semantics (`all`, `vertical`, `horizontal`).
  - Border helpers: `borders` (including defaults, radius-only mode, and edge/axis shorthands).
  - Background helpers: only insofar as they reveal a pattern for future “default reporting” (colors vs images), but not a full background config story.
  - Lint integration at the level of *using* default/introspection APIs, not overhauling the lint script.
- Out of scope (for now):
  - Non-helper concerns (typography, transforms, gradients) unless they naturally share the same AxisValues/defaults pattern and can be folded in without expanding the epic too much.

## Users and use cases

- Library consumers (future sister projects to `css-calipers`):
  - Want to import spacing/border helpers and either:
    - Use the built-in defaults, or
    - Plug in their own defaults later without forking the code.
  - Need clear, minimal documentation of what “default spacing” and “default border” mean.
- App-level styles/components:
  - Should be able to rely on helpers and tokens without repeating defaults at call-sites.
  - Should see clear, ergonomic patterns (top-level width/color, vertical/horizontal shorthands) instead of noisy per-edge duplication.
- Tooling (lint rules, codemods, analyzers):
  - Needs a small API surface to query “what is the default for this helper?” so it can:
    - Flag no-op overrides outside tokens.
    - Encourage use of shorthands where appropriate.

## Constraints and principles

- Helpers first:
  - Keep helpers responsible for defining their own semantics (defaults, axis shorthands), not the linter or the app.
  - Avoid pushing project-specific knowledge into the helpers; defaults should be generic enough to make sense as a separate library.
- Tokens are truth for app-level values:
  - Tokens can define or restate defaults without being punished by lint rules.
  - Non-token code should minimize restatement of defaults and focus on expressing *differences*.
- Minimal surface, maximal clarity:
  - Prefer small, composable APIs (e.g., “get default border config”) over large, highly-configurable objects.
  - Favor documentation and “blessed examples” first, then light guardrails, then stricter enforcement if needed.

## Success criteria

- Conceptual:
  - It is clear, from helper docs and epic files, what the default behavior is for spacing and borders.
  - There is an agreed, documented pattern for using axis shorthands (all/vertical/horizontal) and defaults in helpers.
- Technical:
  - A small, well-documented API exists that can be used to query helper defaults (spacing/borders), suitable for use by lint scripts and future tools.
  - No behavior regressions in existing components/styles; tests and lint continue to pass after the defaults API is introduced.
- Future-facing:
  - It is obvious how to extend the defaults API into a configurable system (e.g., via factories or injected config) without changing existing call signatures.
  - Lint rules can, in a later epic, use the defaults API to flag redundant overrides outside tokens, while leaving tokens free to define or restate defaults.
