import type { StyleRule } from '@vanilla-extract/css';

// Build a StyleRule by combining a base selector with one or more nested
// selector maps. This keeps .css.ts output flat (no multi-level nesting),
// while letting you compose selectors ergonomically in code.
//
// Example:
//   nest('&[data-focus-visibility="focus"]', { outlineOffset: 2 }, [
//     { '&:focus': { outline: '2px solid currentColor' } },
//     { '&:hover, &.focus-class': { textDecoration: 'underline' } },
//   ]);
//
//...nest('&[data-focus-visibility="focus"]', {}, [{}]),

export type NestedSelectors = Record<string, StyleRule>;
export type NestedInput = NestedSelectors | NestedSelectors[];

export function nest(
  base: string,
  baseStyles: StyleRule = {},
  nested: NestedInput = [],
): StyleRule {
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

  const result: StyleRule = { ...baseStyles };
  if (Object.keys(selectors).length > 0) {
    result.selectors = { ...(baseStyles.selectors ?? {}), ...selectors };
  }
  return result;
}

export default nest;
