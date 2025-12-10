The portfolio is built around one rule: structure first, style second. Every
piece of [abbr:UI] flows through a strict pipeline—tokens → helpers → modules →
vanilla-extract styles. Each layer has a single responsibility and is
type-checked in isolation.

Tokens hold only raw data: measurements, colors, timing values. Helpers convert
those into logic—calculations, geometry, and relationships—with compile-time
unit safety via [abbr:CSS] Calipers. Modules compose behavior, and styles are
the only layer allowed to emit selectors, enforced by custom [abbr:ESLint] rules
and lint-staged guards.

That separation makes the system predictable and auditable. Any visual change
can be traced back to a numeric or logical source, and automated tools can
refactor safely because the boundaries are enforced in code, not convention.
It’s the same principle behind design systems that scale: deterministic
structure first, expression second.
