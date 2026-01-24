[MockCode|ts]

I got tired of managing stringy vars in CSS. Concatenating units, losing type
safety the moment a number became `"12px"`, and debugging unit mismatches at
runtime.

So I built CSS-Calipers.

```ts
// The friction:
const spacingPx = 4;
const gutter = `${spacingPx * 3}px`; // string immediately
const heroHeight = `40vh`;
const combo = gutter + heroHeight; // "12px40vh" (valid JS, broken CSS)

// With CSS-Calipers: typed values until the last moment
import { m } from 'css-calipers';

const spacing = m(4); // defaults to px
const gutter = spacing.multiply(3); // 12px, still typed
const heroHeight = m(40, 'vh');
// gutter.add(heroHeight);  ❌
// Type error: can't mix px + vh, find errors while developing, not quiet string mistakes

// Emit CSS only at the boundary
const styles = { gap: gutter.css() }; // "12px"
```

### What stays strings

Keywords (`auto`, `inherit`), CSS variables `var(--spacing)`, and `calc(...)`
expressions remain plain strings. This keeps your output inspectable and
framework-agnostic: no magic runtime, no custom DSL.

### For more information

Check it out on [element:NPMWordmark] or
[element:GitHubWordmark|csscalipers-en]!
[/MockCode]
