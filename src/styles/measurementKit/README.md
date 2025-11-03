# MeasurementKit

**CSS is code. Measure it like one.**  
Compile-time unit safety for CSS values — no surprises at runtime.

MeasurementKit provides a type-safe measurement layer for CSS logic.  
Define, validate, and compose unit-aware values (`px`, `%`, `deg`, `ms`, etc.)
at build time to eliminate silent math errors and improve maintainability in
design-system code.

---

## Features

- Compile-time unit validation and assertions
- Safe arithmetic across matching units
- Explicit `.css()` emission for build-time integration
- Minimal runtime footprint when used as intended
- Framework-agnostic, written in TypeScript
