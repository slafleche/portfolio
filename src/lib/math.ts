import {
  assertPercentMeasurement,
  type PercentMeasurement,
} from '../styles/measurementKit';

export const percentToDecimal = (
  measurement: PercentMeasurement,
): number => {
  assertPercentMeasurement(measurement, 'percentToDecimal');
  return measurement.getValue() / 100;
};
