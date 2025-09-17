// We accept multiple input shapes here to keep call sites ergonomic while

import { CssLike } from '../utilities.css';

// ensuring that this helper always outputs strings.
export type MeasurementLike =
  | { value: number; unit?: string }
  | CssLike
  | string
  | undefined;

// Object representing a CSS measurement (eg. "10px" or "30vh");
export interface IMeasurement {
  value: number;
  unit?: string;
}

// Allows keeping measurement values as a number for easier math,
// and then convert to string for use
export const measurement = (value: number, unit: string = 'px') => {
  return {
    value,
    unit,
    css: () => {
      return `${value}${unit}`;
    },
  };
};

export const modify = (oldMeasurement: IMeasurement, newVal: number) => {
  return measurement(newVal, oldMeasurement.unit);
};

export const parseStringMeasurement = (cssValue: string) => {
  let value = cssValue.trim();
  const unit = value.replace(/^-?(0|[1-9]\d*)?([.][0-9]*)?/, '');
  value = value.substring(0, value.length - unit.length);
  if (value === '-0') {
    value = '0';
  }
  const finalValue = Number(value);
  const finalUnit = `${unit.trim()}`;

  return measurement(finalValue, finalUnit);
};
