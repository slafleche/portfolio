const measurementRegistry = new WeakSet<object>();

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
  typeof x === 'object' && x !== null && measurementRegistry.has(x);

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

  measurementRegistry.add(measurement);
  return Object.freeze(measurement);
};

export const m = (value: number, unit: string = 'px'): IMeasurement =>
  createMeasurement(value, unit.toLowerCase());

type UnitHelper<Unit extends string = string> = ((value: number) => IMeasurement) & {
  unit: Unit;
};

const makeUnitHelper = <Unit extends string>(unit: Unit): UnitHelper<Unit> => {
  const normalizedUnit = unit.toLowerCase() as Unit;
  const helper = ((value: number) =>
    createMeasurement(value, normalizedUnit)) as UnitHelper<Unit>;
  helper.unit = normalizedUnit;
  return helper;
};

export const mPercent = makeUnitHelper('%');

export const mPx = makeUnitHelper('px');
export const mCm = makeUnitHelper('cm');
export const mMm = makeUnitHelper('mm');
export const mQ = makeUnitHelper('q');
export const mIn = makeUnitHelper('in');
export const mPc = makeUnitHelper('pc');
export const mPt = makeUnitHelper('pt');

export const mEm = makeUnitHelper('em');
export const mRem = makeUnitHelper('rem');
export const mEx = makeUnitHelper('ex');
export const mRex = makeUnitHelper('rex');
export const mCh = makeUnitHelper('ch');
export const mRch = makeUnitHelper('rch');
export const mCap = makeUnitHelper('cap');
export const mRcap = makeUnitHelper('rcap');
export const mIc = makeUnitHelper('ic');
export const mRic = makeUnitHelper('ric');
export const mLh = makeUnitHelper('lh');
export const mRlh = makeUnitHelper('rlh');

export const mVw = makeUnitHelper('vw');
export const mVh = makeUnitHelper('vh');
export const mVi = makeUnitHelper('vi');
export const mVb = makeUnitHelper('vb');
export const mVmin = makeUnitHelper('vmin');
export const mVmax = makeUnitHelper('vmax');

export const mSvw = makeUnitHelper('svw');
export const mSvh = makeUnitHelper('svh');
export const mSvi = makeUnitHelper('svi');
export const mSvb = makeUnitHelper('svb');
export const mSvmin = makeUnitHelper('svmin');
export const mSvmax = makeUnitHelper('svmax');

export const mLvw = makeUnitHelper('lvw');
export const mLvh = makeUnitHelper('lvh');
export const mLvi = makeUnitHelper('lvi');
export const mLvb = makeUnitHelper('lvb');
export const mLvmin = makeUnitHelper('lvmin');
export const mLvmax = makeUnitHelper('lvmax');

export const mDvw = makeUnitHelper('dvw');
export const mDvh = makeUnitHelper('dvh');
export const mDvi = makeUnitHelper('dvi');
export const mDvb = makeUnitHelper('dvb');
export const mDvmin = makeUnitHelper('dvmin');
export const mDvmax = makeUnitHelper('dvmax');

export const mCqw = makeUnitHelper('cqw');
export const mCqh = makeUnitHelper('cqh');
export const mCqi = makeUnitHelper('cqi');
export const mCqb = makeUnitHelper('cqb');
export const mCqmin = makeUnitHelper('cqmin');
export const mCqmax = makeUnitHelper('cqmax');

export const mDeg = makeUnitHelper('deg');
export const mRad = makeUnitHelper('rad');
export const mGrad = makeUnitHelper('grad');
export const mTurn = makeUnitHelper('turn');

export const mS = makeUnitHelper('s');
export const mMs = makeUnitHelper('ms');

export const mHz = makeUnitHelper('hz');
export const mKhz = makeUnitHelper('khz');

export const mDpi = makeUnitHelper('dpi');
export const mDpcm = makeUnitHelper('dpcm');
export const mDppx = makeUnitHelper('dppx');

export const mFr = makeUnitHelper('fr');

type MeasurementOf<T extends UnitHelper> = ReturnType<T>;

type UnitGuard<T extends UnitHelper> = (value: unknown) => value is MeasurementOf<T>;

type UnitAssertion<T extends UnitHelper> = (
  value: unknown,
  context?: string,
) => asserts value is MeasurementOf<T>;

const makeUnitGuard = <T extends UnitHelper>(helper: T): UnitGuard<T> => {
  return (value: unknown): value is MeasurementOf<T> =>
    isMeasurement(value) && value.isUnit(helper.unit);
};

const makeUnitAssert = <T extends UnitHelper>(helper: T): UnitAssertion<T> => {
  const guard = makeUnitGuard(helper);
  return (value: unknown, context?: string): asserts value is MeasurementOf<T> => {
    if (!guard(value)) {
      const location = context ? `${context}: ` : '';
      throw new Error(
        `${location}Expected measurement with unit "${helper.unit}".`,
      );
    }
  };
};

export type PercentMeasurement = MeasurementOf<typeof mPercent>;

export type PxMeasurement = MeasurementOf<typeof mPx>;
export type CmMeasurement = MeasurementOf<typeof mCm>;
export type MmMeasurement = MeasurementOf<typeof mMm>;
export type QMeasurement = MeasurementOf<typeof mQ>;
export type InMeasurement = MeasurementOf<typeof mIn>;
export type PcMeasurement = MeasurementOf<typeof mPc>;
export type PtMeasurement = MeasurementOf<typeof mPt>;

export type EmMeasurement = MeasurementOf<typeof mEm>;
export type RemMeasurement = MeasurementOf<typeof mRem>;
export type ExMeasurement = MeasurementOf<typeof mEx>;
export type RexMeasurement = MeasurementOf<typeof mRex>;
export type ChMeasurement = MeasurementOf<typeof mCh>;
export type RchMeasurement = MeasurementOf<typeof mRch>;
export type CapMeasurement = MeasurementOf<typeof mCap>;
export type RcapMeasurement = MeasurementOf<typeof mRcap>;
export type IcMeasurement = MeasurementOf<typeof mIc>;
export type RicMeasurement = MeasurementOf<typeof mRic>;
export type LhMeasurement = MeasurementOf<typeof mLh>;
export type RlhMeasurement = MeasurementOf<typeof mRlh>;

export type VwMeasurement = MeasurementOf<typeof mVw>;
export type VhMeasurement = MeasurementOf<typeof mVh>;
export type ViMeasurement = MeasurementOf<typeof mVi>;
export type VbMeasurement = MeasurementOf<typeof mVb>;
export type VminMeasurement = MeasurementOf<typeof mVmin>;
export type VmaxMeasurement = MeasurementOf<typeof mVmax>;

export type SvwMeasurement = MeasurementOf<typeof mSvw>;
export type SvhMeasurement = MeasurementOf<typeof mSvh>;
export type SviMeasurement = MeasurementOf<typeof mSvi>;
export type SvbMeasurement = MeasurementOf<typeof mSvb>;
export type SvminMeasurement = MeasurementOf<typeof mSvmin>;
export type SvmaxMeasurement = MeasurementOf<typeof mSvmax>;

export type LvwMeasurement = MeasurementOf<typeof mLvw>;
export type LvhMeasurement = MeasurementOf<typeof mLvh>;
export type LviMeasurement = MeasurementOf<typeof mLvi>;
export type LvbMeasurement = MeasurementOf<typeof mLvb>;
export type LvminMeasurement = MeasurementOf<typeof mLvmin>;
export type LvmaxMeasurement = MeasurementOf<typeof mLvmax>;

export type DvwMeasurement = MeasurementOf<typeof mDvw>;
export type DvhMeasurement = MeasurementOf<typeof mDvh>;
export type DviMeasurement = MeasurementOf<typeof mDvi>;
export type DvbMeasurement = MeasurementOf<typeof mDvb>;
export type DvminMeasurement = MeasurementOf<typeof mDvmin>;
export type DvmaxMeasurement = MeasurementOf<typeof mDvmax>;

export type CqwMeasurement = MeasurementOf<typeof mCqw>;
export type CqhMeasurement = MeasurementOf<typeof mCqh>;
export type CqiMeasurement = MeasurementOf<typeof mCqi>;
export type CqbMeasurement = MeasurementOf<typeof mCqb>;
export type CqminMeasurement = MeasurementOf<typeof mCqmin>;
export type CqmaxMeasurement = MeasurementOf<typeof mCqmax>;

export type DegMeasurement = MeasurementOf<typeof mDeg>;
export type RadMeasurement = MeasurementOf<typeof mRad>;
export type GradMeasurement = MeasurementOf<typeof mGrad>;
export type TurnMeasurement = MeasurementOf<typeof mTurn>;

export type SMeasurement = MeasurementOf<typeof mS>;
export type MsMeasurement = MeasurementOf<typeof mMs>;

export type HzMeasurement = MeasurementOf<typeof mHz>;
export type KhzMeasurement = MeasurementOf<typeof mKhz>;

export type DpiMeasurement = MeasurementOf<typeof mDpi>;
export type DpcmMeasurement = MeasurementOf<typeof mDpcm>;
export type DppxMeasurement = MeasurementOf<typeof mDppx>;

export type FrMeasurement = MeasurementOf<typeof mFr>;

export const isPercentMeasurement = makeUnitGuard(mPercent);
export const assertPercentMeasurement = makeUnitAssert(mPercent);

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
  condition: boolean | (() => boolean),
  message: string,
): void => {
  const passed =
    typeof condition === 'function' ? condition() : condition;
  if (!passed) {
    throw new Error(message);
  }
};
