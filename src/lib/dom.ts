import { useId } from 'react';

/**
 * React-friendly id helper for client components. Wraps `useId`,
 * stripping ":" to keep selectors simple.
 */
export function useSafeId(prefix?: string): string {
  const id = useId().replace(/:/g, '');
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Server-safe id generator. Call once per instance and pass the
 * resulting string into components that need deterministic ids.
 */
const counters = new Map<string, number>();

export function createDomId(base = 'id'): string {
  const next = (counters.get(base) ?? 0) + 1;
  counters.set(base, next);
  return `${base}-${next}`;
}
