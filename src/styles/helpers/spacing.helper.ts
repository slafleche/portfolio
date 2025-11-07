import { isMeasurement } from '../measurementKit';
import type { AxisValues, SpacingKeyword, SpacingValue } from './types.helper';

const SPACING_KEYWORDS = new Set<SpacingKeyword>([
  'auto',
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
]);

export type SpacingProps = AxisValues<SpacingValue>;
type SpacingInput = SpacingProps | SpacingValue | undefined;

const isSpacingKeyword = (value: unknown): value is SpacingKeyword =>
  typeof value === 'string' && SPACING_KEYWORDS.has(value as SpacingKeyword);

// IMeasurement → .css(), keyword passthrough
const toCssLen = (v?: SpacingValue): string | undefined => {
  if (v == null) return undefined;
  if (isMeasurement(v)) return v.css();
  if (isSpacingKeyword(v)) return v;
  return undefined;
};

const resolve = (value: SpacingValue | undefined, fallback: string): string => {
  if (value === undefined) return fallback;
  const out = toCssLen(value);
  if (typeof out === 'string') return out;

  const msg = [
    '[spacing] Expected a MeasurementKit value or approved spacing keyword (auto, inherit, initial, unset, revert, revert-layer).',
    'Pass scalar lengths via measurement helpers (e.g., m(8)) or use the spacing helpers (`paddings`, `margins`) instead of raw strings.',
  ].join(' ');

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(msg);
  }
  console.warn(msg);
  return fallback;
};

const normalize = (input?: SpacingInput): SpacingProps | undefined => {
  if (input === undefined) return undefined;
  if (isMeasurement(input)) {
    return { all: input };
  }
  if (isSpacingKeyword(input)) {
    return { all: input };
  }
  if (
    typeof input !== 'object' ||
    input === null ||
    Array.isArray(input)
  ) {
    throw new Error(
      '[spacing] Expected a spacing intent object (e.g., { all, horizontal, vertical }) or approved keyword.',
    );
  }
  return input as SpacingProps;
};

const spacing = (input?: SpacingInput): string => {
  const props = normalize(input);
  const base = resolve(props?.all, '0');

  const verticalBase =
    props?.vertical !== undefined
      ? resolve(props.vertical, base)
      : base;

  const horizontalBase =
    props?.horizontal !== undefined
      ? resolve(props.horizontal, base)
      : base;

  const topSpacing = resolve(props?.top, verticalBase);
  const rightSpacing = resolve(props?.right, horizontalBase);
  const bottomSpacing = resolve(props?.bottom, verticalBase);
  const leftSpacing = resolve(props?.left, horizontalBase);

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

export const paddings = (props?: SpacingInput) => ({
  padding: spacing(props),
});

export const margins = (props?: SpacingInput) => ({
  margin: spacing(props),
});
