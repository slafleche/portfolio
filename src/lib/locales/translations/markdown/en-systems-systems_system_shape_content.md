### Typed inputs at the boundary
Styling values enter the system as typed primitives rather than raw strings. This establishes a clear authoring-time contract and makes invalid or inconsistent values harder to express accidentally.

### Clear start and clear end
The system is defined by its boundaries. Structure and constraints exist at authoring time, while the final output is plain, spec-compliant CSS. CSS remains the source of truth, not an abstracted dialect.

### Meaning applied through domain helpers
Domain helpers apply semantic meaning to values without redefining the platform. They map intent to real CSS properties while keeping the underlying output legible and familiar.

### Flexible composition in the middle
The middle layer is intentionally non-prescriptive. It makes minimal assumptions about how styles are composed, allowing teams to shape the system to the needs of the project rather than forcing a fixed usage pattern.

### Designed to be inspected and replaced
The resulting system is meant to be inspected, debugged, and changed. Parts can be swapped or retired over time without destabilizing the whole, and no single framework or authoring pattern is required.

---

A concrete slice of this approach is published as **css-calipers**, the typed value boundary used throughout this system.  
npm: https://www.npmjs.com/package/css-calipers
