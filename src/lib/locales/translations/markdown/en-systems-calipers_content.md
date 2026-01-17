I wanted numeric CSS values to have the same guarantees as the rest of my code,
so I built CSS-Calipers.

### The problem

CSS values are code, but we treat them like strings. You concatenate units,
parse numbers out of strings, and discover unit mismatches when layouts break in
production instead of at compile time.

### Measurements as structured data

CSS-Calipers treats measurements as typed data with a clear shape: a number and
a unit that stay together until you explicitly need a CSS string. You do math
with helpers like `add()`, `multiply()`, `subtract()`, and `clamp()`. Catch
incompatible operations at compile time, then call `.css()` at the edge. Ideally
at build time for performance, but runtime supported. It is agnostic of your
CSS-in-JS setup.

### Typed [abbr:CSS]

You can keep more (or all) of your styling surface typed. Helpers that normally
accept raw CSS strings can take TypeScript typed inputs from CSS‑Calipers, so
“stringy” style values become real, validated inputs.

### Clear scope and coexistence

The library stays narrow and opinionated about what it handles. It focuses on
numeric, unit-bearing values and leaves keywords, `calc()` expressions, and CSS
variables to your styling layer. It doesn't try to be your entire CSS solution.
It coexists with existing styling systems by handling one thing well: making
measurement math predictable and type-safe.

Check it out on [element:NPMWordmark] or
<span data-white-space="no-wrap">[element:GitHubWordmark]!</span>
