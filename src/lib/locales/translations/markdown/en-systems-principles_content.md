Start from a robust foundation, then build systems that adapt to change rather
than resist it. Add complexity only when it solves real problems, and keep
everything composable so parts can evolve independently.

### Design for change

Long-term change is prioritized over short-term convenience. Systems are
designed to evolve incrementally, so new requirements don’t force rewrites or
layers of workarounds.

### Composition over rigidity

Systems are built up through composition rather than rigid abstractions.
Decisions are encoded once at the system level and reused consistently, reducing
rework and accidental inconsistency as the system grows.

### Respect the platform

Platform specifications remain visible and authoritative. Output is kept
inspectable and debuggable, avoiding opaque layers that make diagnosis and
change harder.

### People over abstractions

System design accounts for users, product vision, and the developers who will
maintain it. Tools are chosen pragmatically based on project needs, not
ideology.

### Clear boundaries and constraints

Separation of concerns allows parts of the system to evolve independently.
Constraints are applied deliberately to reduce accidental complexity and keep
the system understandable over time.
