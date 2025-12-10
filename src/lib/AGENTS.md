# Agent Instructions for `src/lib`

This directory contains shared library utilities (accessibility, architecture,
markdown, responsive helpers, routes, locales, etc.). More specific `AGENTS.md`
files (for example, `src/lib/locales/AGENTS.md`) refine behavior for their
subtrees.

## Responsibilities (`lib-layer`)

- Must: Keep library utilities as framework-agnostic as practical; they should
  not depend directly on React components.
- Must: Centralize cross-cutting helpers here (for example, accessibility
  helpers, route builders, markdown parsing) instead of re-implementing them
  inside components or modules.

## Constraints (`lib-layer`)

- Must: Avoid introducing side effects at import time; prefer pure functions and
  explicit initializers.
- Must: Keep domain-specific behavior (view models, UI layout decisions) in
  modules or components, not in generic library helpers.
