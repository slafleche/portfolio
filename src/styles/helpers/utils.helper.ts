import {
  assertMatchingUnits,
  m,
  type IMeasurement,
} from '../measurementKit';

export const measureHypotenuse = <Unit extends string>(
  a: IMeasurement<Unit>,
  b?: IMeasurement<Unit>,
): IMeasurement<Unit> => {
  if (!b) b = a;
  assertMatchingUnits(a, b, 'measureHypotenuse');
  return m(
    Math.hypot(a.getValue(), b.getValue()),
    a.getUnit(),
  ) as unknown as IMeasurement<Unit>;
};
