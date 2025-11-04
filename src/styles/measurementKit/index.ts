const measurementRegistry = new WeakSet<object>();

type UnitBrand<Unit extends string> = { readonly __unitBrand: Unit };

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

const createMeasurement = <Unit extends string>(
  value: number,
  unit: Unit,
): IMeasurement & UnitBrand<Unit> => {
  const normalizedUnit = unit.toLowerCase() as Unit;

  const measurement = {
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
    add: (delta: DeltaInput) =>
      createMeasurement(
        measurement.value + deltaToNumber(measurement, delta),
        normalizedUnit,
      ),
    subtract: (delta: DeltaInput) =>
      createMeasurement(
        measurement.value - deltaToNumber(measurement, delta),
        normalizedUnit,
      ),
    multiply: (factor: number) => {
      if (factor === 1) return measurement;
      if (factor === 0) return createMeasurement(0, normalizedUnit);
      if (factor === -1)
        return createMeasurement(-measurement.value, normalizedUnit);
      return createMeasurement(
        measurement.value * factor,
        normalizedUnit,
      );
    },
    divide: (divisor: number) => {
      if (divisor === 1) return measurement;
      if (divisor === 0) throw new Error('Divide by zero');
      const result = measurement.value / divisor;
      if (!Number.isFinite(result))
        throw new Error('Non-finite result');
      return createMeasurement(result, normalizedUnit);
    },
    double: () =>
      createMeasurement(measurement.value * 2, normalizedUnit),
    half: () =>
      createMeasurement(measurement.value / 2, normalizedUnit),
    negation: (shouldNegate = true) =>
      shouldNegate
        ? createMeasurement(-measurement.value, measurement.unit)
        : measurement,
    absolute: () =>
      createMeasurement(Math.abs(measurement.value), normalizedUnit),
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
    clamp: (min: IMeasurement, max: IMeasurement) => {
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
  } as unknown as IMeasurement & UnitBrand<Unit>;

  Object.defineProperty(measurement, '__unitBrand', {
    value: normalizedUnit,
    enumerable: false,
  });

  measurementRegistry.add(measurement);
  return Object.freeze(measurement);
};

export const m = <Unit extends string>(
  value: number,
  unit: Unit = 'px' as Unit,
): IMeasurement & UnitBrand<Unit> =>
  createMeasurement(value, unit.toLowerCase() as Unit);

type BrandedMeasurement<Unit extends string> = IMeasurement &
  UnitBrand<Unit>;

type UnitHelper<Unit extends string = string> = ((
  value: number,
) => BrandedMeasurement<Unit>) & {
  unit: Unit;
};

const makeUnitHelper = <Unit extends string>(
  unit: Unit,
): UnitHelper<Unit> => {
  const normalizedUnit = unit.toLowerCase() as Unit;
  const helper = ((value: number) =>
    createMeasurement(value, normalizedUnit)) as UnitHelper<Unit>;
  helper.unit = normalizedUnit;
  return helper;
};

type UnitCategory =
  | 'percent'
  | 'length-absolute'
  | 'length-font-relative'
  | 'length-viewport'
  | 'length-viewport-small'
  | 'length-viewport-large'
  | 'length-viewport-dynamic'
  | 'length-container'
  | 'angle'
  | 'time'
  | 'frequency'
  | 'resolution'
  | 'flex';

type UnitDefinition = {
  unit: string;
  category: UnitCategory;
  description?: string;
};

const UNIT_DEFINITIONS = {
  mPercent: { unit: '%', category: 'percent' },

  mPx: { unit: 'px', category: 'length-absolute' },
  mCm: { unit: 'cm', category: 'length-absolute' },
  mMm: { unit: 'mm', category: 'length-absolute' },
  mQ: { unit: 'q', category: 'length-absolute' },
  mIn: { unit: 'in', category: 'length-absolute' },
  mPc: { unit: 'pc', category: 'length-absolute' },
  mPt: { unit: 'pt', category: 'length-absolute' },

  mEm: { unit: 'em', category: 'length-font-relative' },
  mRem: { unit: 'rem', category: 'length-font-relative' },
  mEx: { unit: 'ex', category: 'length-font-relative' },
  mRex: { unit: 'rex', category: 'length-font-relative' },
  mCh: { unit: 'ch', category: 'length-font-relative' },
  mRch: { unit: 'rch', category: 'length-font-relative' },
  mCap: { unit: 'cap', category: 'length-font-relative' },
  mRcap: { unit: 'rcap', category: 'length-font-relative' },
  mIc: { unit: 'ic', category: 'length-font-relative' },
  mRic: { unit: 'ric', category: 'length-font-relative' },
  mLh: { unit: 'lh', category: 'length-font-relative' },
  mRlh: { unit: 'rlh', category: 'length-font-relative' },

  mVw: { unit: 'vw', category: 'length-viewport' },
  mVh: { unit: 'vh', category: 'length-viewport' },
  mVi: { unit: 'vi', category: 'length-viewport' },
  mVb: { unit: 'vb', category: 'length-viewport' },
  mVmin: { unit: 'vmin', category: 'length-viewport' },
  mVmax: { unit: 'vmax', category: 'length-viewport' },

  mSvw: { unit: 'svw', category: 'length-viewport-small' },
  mSvh: { unit: 'svh', category: 'length-viewport-small' },
  mSvi: { unit: 'svi', category: 'length-viewport-small' },
  mSvb: { unit: 'svb', category: 'length-viewport-small' },
  mSvmin: { unit: 'svmin', category: 'length-viewport-small' },
  mSvmax: { unit: 'svmax', category: 'length-viewport-small' },

  mLvw: { unit: 'lvw', category: 'length-viewport-large' },
  mLvh: { unit: 'lvh', category: 'length-viewport-large' },
  mLvi: { unit: 'lvi', category: 'length-viewport-large' },
  mLvb: { unit: 'lvb', category: 'length-viewport-large' },
  mLvmin: { unit: 'lvmin', category: 'length-viewport-large' },
  mLvmax: { unit: 'lvmax', category: 'length-viewport-large' },

  mDvw: { unit: 'dvw', category: 'length-viewport-dynamic' },
  mDvh: { unit: 'dvh', category: 'length-viewport-dynamic' },
  mDvi: { unit: 'dvi', category: 'length-viewport-dynamic' },
  mDvb: { unit: 'dvb', category: 'length-viewport-dynamic' },
  mDvmin: { unit: 'dvmin', category: 'length-viewport-dynamic' },
  mDvmax: { unit: 'dvmax', category: 'length-viewport-dynamic' },

  mCqw: { unit: 'cqw', category: 'length-container' },
  mCqh: { unit: 'cqh', category: 'length-container' },
  mCqi: { unit: 'cqi', category: 'length-container' },
  mCqb: { unit: 'cqb', category: 'length-container' },
  mCqmin: { unit: 'cqmin', category: 'length-container' },
  mCqmax: { unit: 'cqmax', category: 'length-container' },

  mDeg: { unit: 'deg', category: 'angle' },
  mRad: { unit: 'rad', category: 'angle' },
  mGrad: { unit: 'grad', category: 'angle' },
  mTurn: { unit: 'turn', category: 'angle' },

  mS: { unit: 's', category: 'time' },
  mMs: { unit: 'ms', category: 'time' },

  mHz: { unit: 'hz', category: 'frequency' },
  mKhz: { unit: 'khz', category: 'frequency' },

  mDpi: { unit: 'dpi', category: 'resolution' },
  mDpcm: { unit: 'dpcm', category: 'resolution' },
  mDppx: { unit: 'dppx', category: 'resolution' },

  mFr: { unit: 'fr', category: 'flex' },
} as const satisfies Record<string, UnitDefinition>;

type UnitDefinitionRecord = typeof UNIT_DEFINITIONS;
type UnitHelperName = keyof UnitDefinitionRecord;

const makeUnitHelperFromDefinition = <Name extends UnitHelperName>(
  name: Name,
): UnitHelper<UnitDefinitionRecord[Name]['unit']> =>
  makeUnitHelper(UNIT_DEFINITIONS[name].unit);

export const measurementUnitMetadata = UNIT_DEFINITIONS;
export type MeasurementUnitDefinition = UnitDefinition;
export type MeasurementUnitCategory = UnitCategory;

export const mPercent = makeUnitHelperFromDefinition('mPercent');

export const mPx = makeUnitHelperFromDefinition('mPx');
export const mCm = makeUnitHelperFromDefinition('mCm');
export const mMm = makeUnitHelperFromDefinition('mMm');
export const mQ = makeUnitHelperFromDefinition('mQ');
export const mIn = makeUnitHelperFromDefinition('mIn');
export const mPc = makeUnitHelperFromDefinition('mPc');
export const mPt = makeUnitHelperFromDefinition('mPt');

export const mEm = makeUnitHelperFromDefinition('mEm');
export const mRem = makeUnitHelperFromDefinition('mRem');
export const mEx = makeUnitHelperFromDefinition('mEx');
export const mRex = makeUnitHelperFromDefinition('mRex');
export const mCh = makeUnitHelperFromDefinition('mCh');
export const mRch = makeUnitHelperFromDefinition('mRch');
export const mCap = makeUnitHelperFromDefinition('mCap');
export const mRcap = makeUnitHelperFromDefinition('mRcap');
export const mIc = makeUnitHelperFromDefinition('mIc');
export const mRic = makeUnitHelperFromDefinition('mRic');
export const mLh = makeUnitHelperFromDefinition('mLh');
export const mRlh = makeUnitHelperFromDefinition('mRlh');

export const mVw = makeUnitHelperFromDefinition('mVw');
export const mVh = makeUnitHelperFromDefinition('mVh');
export const mVi = makeUnitHelperFromDefinition('mVi');
export const mVb = makeUnitHelperFromDefinition('mVb');
export const mVmin = makeUnitHelperFromDefinition('mVmin');
export const mVmax = makeUnitHelperFromDefinition('mVmax');

export const mSvw = makeUnitHelperFromDefinition('mSvw');
export const mSvh = makeUnitHelperFromDefinition('mSvh');
export const mSvi = makeUnitHelperFromDefinition('mSvi');
export const mSvb = makeUnitHelperFromDefinition('mSvb');
export const mSvmin = makeUnitHelperFromDefinition('mSvmin');
export const mSvmax = makeUnitHelperFromDefinition('mSvmax');

export const mLvw = makeUnitHelperFromDefinition('mLvw');
export const mLvh = makeUnitHelperFromDefinition('mLvh');
export const mLvi = makeUnitHelperFromDefinition('mLvi');
export const mLvb = makeUnitHelperFromDefinition('mLvb');
export const mLvmin = makeUnitHelperFromDefinition('mLvmin');
export const mLvmax = makeUnitHelperFromDefinition('mLvmax');

export const mDvw = makeUnitHelperFromDefinition('mDvw');
export const mDvh = makeUnitHelperFromDefinition('mDvh');
export const mDvi = makeUnitHelperFromDefinition('mDvi');
export const mDvb = makeUnitHelperFromDefinition('mDvb');
export const mDvmin = makeUnitHelperFromDefinition('mDvmin');
export const mDvmax = makeUnitHelperFromDefinition('mDvmax');

export const mCqw = makeUnitHelperFromDefinition('mCqw');
export const mCqh = makeUnitHelperFromDefinition('mCqh');
export const mCqi = makeUnitHelperFromDefinition('mCqi');
export const mCqb = makeUnitHelperFromDefinition('mCqb');
export const mCqmin = makeUnitHelperFromDefinition('mCqmin');
export const mCqmax = makeUnitHelperFromDefinition('mCqmax');

export const mDeg = makeUnitHelperFromDefinition('mDeg');
export const mRad = makeUnitHelperFromDefinition('mRad');
export const mGrad = makeUnitHelperFromDefinition('mGrad');
export const mTurn = makeUnitHelperFromDefinition('mTurn');

export const mS = makeUnitHelperFromDefinition('mS');
export const mMs = makeUnitHelperFromDefinition('mMs');

export const mHz = makeUnitHelperFromDefinition('mHz');
export const mKhz = makeUnitHelperFromDefinition('mKhz');

export const mDpi = makeUnitHelperFromDefinition('mDpi');
export const mDpcm = makeUnitHelperFromDefinition('mDpcm');
export const mDppx = makeUnitHelperFromDefinition('mDppx');

export const mFr = makeUnitHelperFromDefinition('mFr');

type MeasurementOf<T extends UnitHelper> = ReturnType<T>;

type UnitGuard<T extends UnitHelper> = (
  value: unknown,
) => value is MeasurementOf<T>;

type UnitAssertion<T extends UnitHelper> = (
  value: unknown,
  context?: string,
) => asserts value is MeasurementOf<T>;

const makeUnitGuard = <T extends UnitHelper>(
  helper: T,
): UnitGuard<T> => {
  return (value: unknown): value is MeasurementOf<T> =>
    isMeasurement(value) && value.isUnit(helper.unit);
};

const makeUnitAssert = <T extends UnitHelper>(
  helper: T,
): UnitAssertion<T> => {
  const guard = makeUnitGuard(helper);
  return (
    value: unknown,
    context?: string,
  ): asserts value is MeasurementOf<T> => {
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
export const assertPercentMeasurement: (
  value: unknown,
  context?: string,
) => asserts value is PercentMeasurement = makeUnitAssert(mPercent);

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
