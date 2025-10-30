const brandSet = new WeakSet<object>();

export interface IMeasurement {
  readonly value: number;
  readonly unit: string;
  css: () => string;
  toString: () => string;
  valueOf: () => number;
  getUnit: () => string;
  isUnit: (unit: string) => boolean;
  assertUnit: (unit: string, context?: string) => void;
  assert: (
    predicate: (measurement: IMeasurement) => boolean,
    message: string,
  ) => void;
  toPercentDecimal: () => number;
  add: (delta: DeltaInput) => IMeasurement;
  subtract: (delta: DeltaInput) => IMeasurement;
  multiply: (factor: number) => IMeasurement;
  divide: (divisor: number) => IMeasurement;
  double: () => IMeasurement;
  half: () => IMeasurement;
  negation: (shouldNegate?: boolean) => IMeasurement;
  absolute: () => IMeasurement;
  round: (precision?: number) => IMeasurement;
  floor: () => IMeasurement;
  ceil: () => IMeasurement;
  clamp: (min: IMeasurement, max: IMeasurement) => IMeasurement;
}

type DeltaInput = number | IMeasurement;

export const assertMatchingUnits = (
  left: IMeasurement,
  right: IMeasurement,
  context: string,
): void => {
  if (left.unit !== right.unit) {
    const where = context ? `${context}: ` : '';
    throw new Error(
      `${where}measurement unit mismatch: ${left.unit} vs ${right.unit}`,
    );
  }
};

export const isMeasurement = (x: unknown): x is IMeasurement =>
  typeof x === 'object' && x !== null && brandSet.has(x);

const deltaToNumber = (
  base: IMeasurement,
  delta: DeltaInput,
): number => {
  if (typeof delta === 'number') return delta;
  assertMatchingUnits(base, delta, 'deltaToNumber');
  return delta.value;
};

const createMeasurement = (
  value: number,
  unit: string,
): IMeasurement => {
  const normalizedUnit = unit.toLowerCase();

  const measurement: IMeasurement = {
    value,
    unit: normalizedUnit,
    css: () => `${measurement.value}${measurement.unit}`,
    toString: () => `${measurement.value}${measurement.unit}`,
    valueOf: () => measurement.value,
    getUnit: () => measurement.unit,
    isUnit: (expected: string) =>
      measurement.unit === expected.toLowerCase(),
    assertUnit: (expected: string, context?: string) => {
      if (!measurement.isUnit(expected)) {
        const location = context ? `${context}: ` : '';
        throw new Error(
          `${location}Expected unit "${expected}", received "${measurement.unit}".`,
        );
      }
    },
    assert: (
      predicate: (measurement: IMeasurement) => boolean,
      message: string,
    ) => {
      if (!predicate(measurement)) {
        throw new Error(message);
      }
    },
    toPercentDecimal: () => {
      if (!measurement.isUnit('%')) {
        throw new Error(
          `Cannot convert measurement with unit "${measurement.unit}" to percent decimal.`,
        );
      }
      return measurement.value / 100;
    },
    add: (delta) =>
      createMeasurement(
        measurement.value + deltaToNumber(measurement, delta),
        measurement.unit,
      ),
    subtract: (delta) =>
      createMeasurement(
        measurement.value - deltaToNumber(measurement, delta),
        measurement.unit,
      ),
    multiply: (factor) => {
      if (factor === 1) return measurement;
      if (factor === 0) return createMeasurement(0, measurement.unit);
      if (factor === -1)
        return createMeasurement(
          -measurement.value,
          measurement.unit,
        );
      return createMeasurement(
        measurement.value * factor,
        measurement.unit,
      );
    },
    divide: (divisor) => {
      if (divisor === 1) return measurement;
      if (divisor === 0) throw new Error('Divide by zero');
      const result = measurement.value / divisor;
      if (!Number.isFinite(result))
        throw new Error('Non-finite result');
      return createMeasurement(result, measurement.unit);
    },
    double: () =>
      createMeasurement(measurement.value * 2, measurement.unit),
    half: () =>
      createMeasurement(measurement.value / 2, measurement.unit),
    negation: (shouldNegate = true) =>
      shouldNegate
        ? createMeasurement(-measurement.value, measurement.unit)
        : measurement,
    absolute: () =>
      createMeasurement(
        Math.abs(measurement.value),
        measurement.unit,
      ),
    round: (precision = 0) => {
      const next =
        precision === 0
          ? Math.round(measurement.value)
          : Number(measurement.value.toFixed(precision));
      return next === measurement.value
        ? measurement
        : createMeasurement(next, measurement.unit);
    },
    floor: () => {
      const next = Math.floor(measurement.value);
      return next === measurement.value
        ? measurement
        : createMeasurement(next, measurement.unit);
    },
    ceil: () => {
      const next = Math.ceil(measurement.value);
      return next === measurement.value
        ? measurement
        : createMeasurement(next, measurement.unit);
    },
    clamp: (min, max) => {
      assertMatchingUnits(measurement, min, 'clamp(min)');
      assertMatchingUnits(measurement, max, 'clamp(max)');
      const u = measurement.unit;
      const v =
        measurement.value < min.value
          ? min.value
          : measurement.value > max.value
            ? max.value
            : measurement.value;
      return v === measurement.value
        ? measurement
        : createMeasurement(v, u);
    },
  };

  brandSet.add(measurement);
  return Object.freeze(measurement);
};

export const m = (value: number, unit: string = 'px'): IMeasurement =>
  createMeasurement(value, unit.toLowerCase());

export const mPercent = (value: number): IMeasurement =>
  createMeasurement(value, '%');

export const double = (measurement: IMeasurement) =>
  measurement.double();
export const half = (measurement: IMeasurement) => measurement.half();
export const negation = (
  measurement: IMeasurement,
  shouldNegate = true,
) => measurement.negation(shouldNegate);

export const measurementMin = (a: IMeasurement, b: IMeasurement) => {
  assertMatchingUnits(a, b, 'measurementMin');
  const winner = a.value < b.value ? a : b;
  return a === winner ? a : m(winner.value, winner.unit);
};

export const measurementMax = (a: IMeasurement, b: IMeasurement) => {
  assertMatchingUnits(a, b, 'measurementMax');
  const winner = a.value > b.value ? a : b;
  return a === winner ? a : m(winner.value, winner.unit);
};

export const hasCssMethod = (
  x: unknown,
): x is { css: () => string } => {
  return (
    typeof x === 'object' &&
    x !== null &&
    'css' in x &&
    typeof (x as { css: unknown }).css === 'function'
  );
};

export const assertUnit = (
  measurement: IMeasurement,
  expectedUnit: string,
  context?: string,
) => measurement.assertUnit(expectedUnit, context);

export const measurementHypotenuse = (
  a: IMeasurement,
  b?: IMeasurement,
): IMeasurement => {
  if (!b) b = a;
  assertMatchingUnits(a, b, 'measurementHypotenuse');
  return m(Math.hypot(a.value, b.value), a.unit);
};

export const assertCondition = (
  condition: boolean,
  message: string,
): void => {
  if (!condition) {
    throw new Error(message);
  }
};
