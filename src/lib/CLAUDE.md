# `src/lib` — shared library utilities

Shared utilities (accessibility, architecture, markdown, responsive helpers,
routes, locales). More specific `CLAUDE.md` files (e.g.
`src/lib/locales/CLAUDE.md`) refine behavior for subtrees.

- Keep library utilities framework-agnostic as practical. They should not
  depend directly on React components.
- Centralize cross-cutting helpers here (accessibility helpers, route
  builders, markdown parsing) instead of re-implementing inside components
  or modules.
- Avoid side effects at import time. Prefer pure functions and explicit
  initializers.
- Keep domain-specific behavior (view models, UI layout decisions) in
  modules or components, not in generic library helpers.
