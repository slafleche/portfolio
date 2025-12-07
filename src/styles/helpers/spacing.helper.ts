import { isMeasurement, m } from 'css-calipers';
import type { AxisValues, SpacingKeyword, SpacingValue } from './types.helper';

const SPACING_KEYWORDS = new Set<SpacingKeyword>([
  'auto',
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
]);

const defaultSpacing = (): SpacingFourSides => ({
  top: m(0),
  right: m(0),
  bottom: m(0),
  left: m(0),
});

/**
 * Spacing intent (internal):
 * - Prefer `all` when every side shares the same spacing.
 * - Prefer `vertical` when top/bottom are the same.
 * - Prefer `horizontal` when left/right are the same.
 * - Use explicit `top`/`right`/`bottom`/`left` only for asymmetrical cases.
 *
 * External callers should eventually rely on `SpacingIntent` (which omits the
 * internal `all` axis) plus value shorthands; helpers keep this richer shape
 * for their own resolution logic.
 */
export type SpacingIntentInternal = AxisValues<SpacingValue>;

export type SpacingIntent = {
  horizontal?: SpacingValue;
  vertical?: SpacingValue;
} & Partial<Record<'top' | 'right' | 'bottom' | 'left', SpacingValue>>;

export type SpacingInput = SpacingIntentInternal | undefined;
export type SpacingInputPublic =
  | SpacingValue
  | SpacingIntent
  | undefined;
export type SpacingFourSides = {
  top: SpacingValue;
  right: SpacingValue;
  bottom: SpacingValue;
  left: SpacingValue;
};

const isSpacingKeyword = (value: unknown): value is SpacingKeyword =>
  typeof value === 'string' && SPACING_KEYWORDS.has(value as SpacingKeyword);

const spacingToCss = (v: SpacingValue): string => {
  if (isMeasurement(v)) return v.css();
  if (isSpacingKeyword(v)) return v;
  throw new Error(
    '[spacing] Expected a css-calipers measurement value or approved spacing keyword (auto, inherit, initial, unset, revert, revert-layer).',
  );
};

const resolve = (
  candidates: Array<SpacingValue | undefined>,
  fallback: SpacingValue,
): string => {
  for (const candidate of candidates) {
    if (candidate !== undefined) {
      return spacingToCss(candidate);
    }
  }
  return spacingToCss(fallback);
};

const normalize = (
  input?: SpacingInput | SpacingInputPublic,
): SpacingIntentInternal | undefined => {
  if (input === undefined) return undefined;

  if (isMeasurement(input) || isSpacingKeyword(input)) {
    return {
      all: input,
    } as SpacingIntentInternal;
  }

  if (
    typeof input === 'object' &&
    input !== null &&
    !Array.isArray(input)
  ) {
    return input as SpacingIntentInternal;
  }

  throw new Error(
    '[spacing] Expected a spacing value or spacing intent object (e.g., { vertical, horizontal }). Wrap unsupported inputs accordingly.',
  );
};

const spacing = (
  input?: SpacingInput | SpacingInputPublic,
): string => {
  const defaults = defaultSpacing();
  const props = normalize(input);

  const topSpacing = resolve([props?.top, props?.vertical, props?.all], defaults.top);
  const rightSpacing = resolve([props?.right, props?.horizontal, props?.all], defaults.right);
  const bottomSpacing = resolve([props?.bottom, props?.vertical, props?.all], defaults.bottom);
  const leftSpacing = resolve([props?.left, props?.horizontal, props?.all], defaults.left);

  const allEqual =
    topSpacing === rightSpacing &&
    rightSpacing === bottomSpacing &&
    bottomSpacing === leftSpacing;

  if (allEqual) return topSpacing;

  const verticalSymmetry = topSpacing === bottomSpacing;
  const horizontalSymmetry = leftSpacing === rightSpacing;

  if (verticalSymmetry && horizontalSymmetry) {
    return `${topSpacing} ${rightSpacing}`;
  }

  if (horizontalSymmetry) {
    return `${topSpacing} ${rightSpacing} ${bottomSpacing}`;
  }

  return `${topSpacing} ${rightSpacing} ${bottomSpacing} ${leftSpacing}`;
};

export const paddings = (
  props?: SpacingInput | SpacingInputPublic,
) => ({
  padding: spacing(props),
});

export const margins = (
  props?: SpacingInput | SpacingInputPublic,
) => ({
  margin: spacing(props),
});
