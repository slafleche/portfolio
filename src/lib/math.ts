import {
  isPercentMeasurement,
  type PercentMeasurement,
} from 'css-calipers';

export const percentToDecimal = (
  measurement: PercentMeasurement,
): number => {
  if (!isPercentMeasurement(measurement)) {
    throw new TypeError(
      '[math] percentToDecimal expected a PercentMeasurement.',
    );
  }
  return measurement.getValue() / 100;
};
