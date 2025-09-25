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
  css: () => string;
  add: (delta: number) => IMeasurement;
  subtract: (delta: number) => IMeasurement;
  multiply: (factor: number) => IMeasurement;
  divide: (divisor: number) => IMeasurement;
}

// Allows keeping measurement values as a number for easier math,
// and then convert to string for use
export const m = (value: number, unit: string = 'px'): IMeasurement => {
  const build = (nextValue: number): IMeasurement => ({
    value: nextValue,
    unit,
    css: () => `${nextValue}${unit}`,
    add: (delta: number) => build(nextValue + delta),
    subtract: (delta: number) => build(nextValue - delta),
    multiply: (factor: number) => build(nextValue * factor),
    divide: (divisor: number) => build(nextValue / divisor),
  });

  return build(value);
};

export const modify = (oldMeasurement: IMeasurement, newVal: number): IMeasurement => {
  return m(newVal, oldMeasurement.unit ?? 'px');
};

export const parseStringMeasurement = (cssValue: string): IMeasurement => {
  let value = cssValue.trim();
  const unit = value.replace(/^-?(0|[1-9]\d*)?([.][0-9]*)?/, '');
  value = value.substring(0, value.length - unit.length);
  if (value === '-0') {
    value = '0';
  }
  const finalValue = Number(value);
  const finalUnit = unit.trim() || 'px';

  return m(finalValue, finalUnit);
};
