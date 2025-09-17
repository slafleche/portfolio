import type { StyleRule } from '@vanilla-extract/css';

// Build a flattened selector map by combining a base selector with one or more
// nested selector maps. Use this to spread under `selectors: { ... }`.
//
// Example (usage under selectors):
//   selectors: {
//     ...nest('&[data-focus-visibility="focus"]', [
//       { '&:focus': { outline: '2px solid currentColor' } },
//       { '&:hover, &.focus-class': { textDecoration: 'underline' } },
//     ]),
//   }
// Quick copy:
// ...nest('&[data-focus-visibility="focus"]', {}, [{}]),

export type NestedSelectors = Record<string, StyleRule>;
export type NestedInput = NestedSelectors | NestedSelectors[];

export function nest(
  base: string,
  nested: NestedInput = [],
): Record<string, StyleRule> {
  const items = Array.isArray(nested) ? nested : [nested];
  const selectors: Record<string, StyleRule> = {};

  const baseTrim = base.trim();
  const baseScoped = baseTrim.startsWith('&') ? baseTrim : `&${baseTrim}`;

  for (const entry of items) {
    for (const [key, val] of Object.entries(entry)) {
      // Support comma-separated nested selectors
      const parts = key
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const combined = parts
        .map((s) => {
          const suffix = s.startsWith('&') ? s.slice(1) : s;
          return `${baseScoped}${suffix}`;
        })
        .join(', ');

      selectors[combined] = val;
    }
  }

  return selectors;
}

export default nest;
