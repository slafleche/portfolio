### Measurement System

CSS should be treated with the same structure and reliability as any other
code.  
It stays flexible by default and only gets strict where math needs guarantees.

A Measurement object defines the value and unit.  
Values can be transformed with intuitive, English-style helpers, and the results
are compiled to CSS at build time through Vanilla Extract.  
Each component can set its own guardrails.

```ts
const offset = m(8, 'px');
const curve = m(24, 'px');

if (process.env.NODE_ENV !== 'production') {
  assertUnit(offset, 'px', 'offset');
  assertUnit(curve, 'px', 'curve');
  assertCondition(customValidation(offset, curve), 'Final curve'); // case specific test
}

const total = offset.add(curve).multiply(2).css(); // "64px"
```

It’s a balance of flexibility and rigour — expressive to use, but predictable in
every result.

---

### Color Wrapper

Modern colors are complex and need the same rigour as any other system.  
They require careful handling and smart fallbacks to use their full range
safely.  
The color wrapper brings structure to that process with clear rules and
English-style helpers.

```ts
const background = color('#453564');
const shadow = background.darken(0.8).desaturate(0.2).alpha(0.5);

style({
  backgroundColor: colorVars.bodyBg.css(),
  boxShadow: `0 4px 12px ${shadow.css()}`,
});
```

Operations return new values, so shared tokens never mutate.  
Final output happens at `.css()`, which makes rendering predictable.  
Shared rules enforce ranges for contrast, lightness, and alpha, so gradients and
UI states stay readable.

The internals can change and the contract stays the same.  
That keeps color work composable, consistent, and safe to refactor.

