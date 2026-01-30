[MockCode|ts] The system has clear boundaries: typed inputs at the start, plain
[abbr:CSS] at the end, and flexible composition in between. This isn't about
rigid structure. It's about preventing the two failure modes I see most often:
string soup at authoring time, and abstraction layers that lag behind the
platform. [/MockCode]

### Typed inputs at the boundary

Styling values enter the system as typed primitives rather than raw strings.
This prevents the concatenation hell described in the
[CSS Calipers](#css-calipers) section: no more `"12px" + "40vh"` producing
`"12px40vh"`, no more losing type safety the moment a number becomes a string,
no more runtime surprises from unit mismatches.

The types enforce consistency at authoring time. You can't accidentally mix
incompatible units or pass invalid values. Mistakes surface immediately, not
when a user reports broken spacing.

### Clear start and clear end

Structure and constraints exist at authoring time. The final output is plain,
spec-compliant CSS. This matters because I've worked on projects where the
component model couldn't express the full range of HTML/CSS. We were behind the
actual spec, relying on hacks in JavaScript to modify post-render output just to
use features browsers already supported.

CSS remains the source of truth, not an abstracted dialect. You can inspect what
shipped, debug it with standard tools, and adopt new CSS features the moment
browsers support them. No waiting for your framework to catch up.

### Semantic intent, real CSS

Domain abstractions like `borders()` or `spacing()` attach meaning to values
without changing the platform. They make intent explicit and reduce repetition,
but the output is still recognizable CSS properties. The abstraction layer adds
clarity, not mystery. If you inspect the result, you see
`border: 1px solid #fff`, not some intermediate representation.

### Designed to be inspected and replaced

Parts can be swapped or retired over time without destabilizing the whole. No
single framework or authoring pattern is required. If a better tool emerges, or
project needs shift, you can replace pieces incrementally. Nothing becomes a
dead end.

The portfolio site you're reading is open source on
<span data-white-space="no-wrap">[element:GitHubWordmark|site-en],</span> as is
CSS Calipers on
<span data-white-space="no-wrap">[element:NPMWordmark|en].</span>

### Flexible composition in the middle

This is where the framework comparison matters. Most CSS "frameworks" are really
libraries: collections of utilities or components. My Tetrachromatic approach is
closer to a programming framework like PHP. You have expected inputs (typed
values) and outputs (spec-compliant CSS), but the middle is yours to structure.

I have helpers and opinions on how to get there, but you can do whatever you
want. Don't like my `colorWrapper`? Write your own, just use the types. Don't
like the `borders()` helper? Hand-write border styles. The system cares about
the **bookends** (typed inputs and real CSS output), not how you organize the
middle.
