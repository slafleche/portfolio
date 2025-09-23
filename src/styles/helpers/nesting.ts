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

// Split a selector list on top-level commas, ignoring commas inside () and []
function splitSelectorList(input: string): string[] {
  const out: string[] = [];
  let cur = '';
  let paren = 0;
  let bracket = 0;
  let quote: string | null = null;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const prev = i > 0 ? input[i - 1] : '';
    if (quote) {
      cur += ch;
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === '(') paren++;
    else if (ch === ')' && paren > 0) paren--;
    else if (ch === '[') bracket++;
    else if (ch === ']' && bracket > 0) bracket--;

    if (ch === ',' && paren === 0 && bracket === 0) {
      const piece = cur.trim();
      if (piece) out.push(piece);
      cur = '';
    } else {
      cur += ch;
    }
  }
  const last = cur.trim();
  if (last) out.push(last);
  return out;
}

// Overloads: styles or nested maps
export function nest(base: string, styles: StyleRule): Record<string, StyleRule>;
export function nest(base: string, nested: NestedInput): Record<string, StyleRule>;
export function nest(
  base: string,
  second: StyleRule | NestedInput = {},
): Record<string, StyleRule> {
  const bases = splitSelectorList(base)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => (b.startsWith('&') ? b : `&${b}`));

  const selectors: Record<string, StyleRule> = {};

  const isNestedMap = (v: unknown): v is NestedSelectors | NestedSelectors[] => {
    if (Array.isArray(v)) return true;
    if (v && typeof v === 'object') {
      const keys = Object.keys(v as Record<string, unknown>);
      // Heuristic: treat as nested map if any key looks like a selector (starts with '&' or ':')
      return keys.some((k) => k.trim().startsWith('&') || k.trim().startsWith(':'));
    }
    return false;
  };

  if (!isNestedMap(second)) {
    // StyleRule case: apply styles to each base selector directly
    for (const b of bases) selectors[b] = second;
    return selectors;
  }

  // Nested case
  const items = Array.isArray(second) ? second : [second];
  for (const entry of items) {
    for (const [key, val] of Object.entries(entry)) {
      const nestedParts = splitSelectorList(key)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const b of bases) {
        const combined = nestedParts
          .map((s) => {
            const suffix = s.startsWith('&') ? s.slice(1) : s;
            return `${b}${suffix}`;
          })
          .join(', ');
        selectors[combined] = val;
      }
    }
  }

  return selectors;
}

export default nest;
