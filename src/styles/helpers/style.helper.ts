// helpers/style.ts
import type { ColorWrapper } from './colorWrap';
import type { Color as ChromaColor } from 'chroma-js';
import { isMeasurement, hasCssMethod } from '../measurementKit';
import type { MeasurementLike } from './types';

export type CssColorish =
  | string
  | ColorWrapper
  | ChromaColor
  | null
  | undefined;

export const toCssColor = (
  value?: CssColorish,
): string | undefined => {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  if (hasCssMethod(value)) return value.css();

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(
      `[toCssColor] Unsupported input: ${Object.prototype.toString.call(value)}`,
    );
  }
  console.warn('[toCssColor] Unsupported input; ignoring');
  return undefined;
};

// number → px, string passthrough, IMeasurement → .css()
export const toCssMeasurement = (
  value?: MeasurementLike | number | string | null,
): string | undefined => {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value))
    return `${value}px`;
  if (isMeasurement(value)) return value.css();

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(
      `[toCssMeasurement] Unsupported input: ${Object.prototype.toString.call(value)}`,
    );
  }
  console.warn('[toCssMeasurement] Unsupported input; ignoring');
  return undefined;
};
