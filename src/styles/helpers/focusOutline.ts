import { toCssColor, toCssMeasurement } from './style';
import type { MeasurementLike } from './types';
import type { ColorWrapper } from './colorWrap';
import type { Color as ChromaColor } from 'chroma-js';

type Colorish =
  | string
  | ColorWrapper
  | ChromaColor
  | null
  | undefined;

export type FocusOutlineOptions = {
  color?: Colorish;
  width?: MeasurementLike | number | null;
  offset?: MeasurementLike | number | null;
};

export const focusOutline = ({
  color = 'currentColor',
  width = 2,
  offset = 2,
}: FocusOutlineOptions = {}) => {
  const outlineWidth = toCssMeasurement(width) ?? '2px';
  const outlineOffset = toCssMeasurement(offset) ?? '2px';
  const outlineColor = toCssColor(color) ?? 'currentColor';

  return {
    outline: `${outlineWidth} solid ${outlineColor}`,
    outlineOffset,
  } as const;
};
