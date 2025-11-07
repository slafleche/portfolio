import { isMeasurement } from '../measurementKit';
import type { AxisValues, MeasurementLike } from './types';

type SpacingValue =
  | MeasurementLike
  | number
  | string
  | null
  | undefined;
export type SpacingProps = AxisValues<SpacingValue>;
type SpacingInput = SpacingProps | SpacingValue;

// number → px, IMeasurement → .css(), string passthrough
const toCssLen = (v: SpacingValue): string | undefined => {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'number')
    return Number.isFinite(v) ? `${v}px` : undefined;
  if (isMeasurement(v)) return v.css();
  return undefined;
};

const resolve = (value: SpacingValue, fallback: string): string => {
  if (value === undefined || value === null) return fallback;
  const out = toCssLen(value);
  if (typeof out === 'string') return out;

  const msg = `[spacing] Expected CSS length; got ${
    typeof value === 'string' || typeof value === 'number'
      ? `${typeof value}:${value}`
      : Object.prototype.toString.call(value)
  }. Pass a string/number or an IMeasurement.`;

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(msg);
  }
  console.warn(msg);
  return fallback;
};

const normalize = (input?: SpacingInput): SpacingProps | undefined => {
  if (input === undefined || input === null) return undefined;

  if (
    typeof input === 'string' ||
    typeof input === 'number' ||
    isMeasurement(input)
  ) {
    return { all: input };
  }

  if (typeof input === 'object') {
    const intent = { ...input } as SpacingProps;
    if (
      'width' in intent ||
      'color' in intent ||
      'style' in intent
    ) {
      throw new Error(
        '[spacing] Unexpected border shorthand properties on spacing intent.',
      );
    }
    return intent;
  }

  return undefined;
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
