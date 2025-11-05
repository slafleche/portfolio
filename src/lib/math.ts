import {
  isPercentMeasurement,
  type PercentMeasurement,
} from '../styles/measurementKit';

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
