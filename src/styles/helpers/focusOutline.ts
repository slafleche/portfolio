import { toCssMeasurement, toCssColor } from './style';
import type { MeasurementLike } from './types';

export type FocusOutlineOptions = {
  color?: unknown;
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
  const outlineColor =
    typeof color === 'string' ? color : toCssColor(color);

  return {
    outline: `${outlineWidth} solid ${outlineColor}`,
    outlineOffset,
  } as const;
};
