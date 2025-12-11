/**
 * Assert ARIA IDREF wiring in tests.
 *
 * Companion to the `custom/aria-idref-helper-required` ESLint rule:
 * any test that touches ARIA IDREF attributes (like
 * `aria-describedby`) is expected to use this helper (or a wrapper)
 * to verify that an element with an `id` is correctly referenced by
 * the ARIA attribute. We can't and don't protect against every case,
 * but at least if on the foe Aria attributes with an ID are called,
 * we must do a check
 */

export type AriaIdRefKind =
  | 'activedescendant'
  | 'controls'
  | 'describedby'
  | 'details'
  | 'errormessage'
  | 'flowto'
  | 'labelledby'
  | 'owns';

const ATTR_MAP: Record<AriaIdRefKind, string> = {
  activedescendant: 'aria-activedescendant',
  controls: 'aria-controls',
  describedby: 'aria-describedby',
  details: 'aria-details',
  errormessage: 'aria-errormessage',
  flowto: 'aria-flowto',
  labelledby: 'aria-labelledby',
  owns: 'aria-owns',
};

export function checkMatchingId(
  source: Element | null,
  target: Element | null,
  kind: AriaIdRefKind,
) {
  if (!source || !target) {
    return false;
  }
  const attrName = ATTR_MAP[kind];
  const sourceId = source.id;
  if (!sourceId) return false;

  const raw = target.getAttribute(attrName);
  if (!raw) return false;

  const tokens = raw?.split(/\s+/).filter(Boolean) ?? [];
  return tokens.includes(sourceId);
}
