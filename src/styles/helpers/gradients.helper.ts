import {
  type DegMeasurement,
  type IMeasurement,
  m,
  mPercent,
  type PercentMeasurement,
} from 'css-calipers';
import type { Property } from 'csstype';

import { clamp } from '../../lib/math';
import {
  color,
  colorFallback,
  colorModern,
  type ColorWrapper,
} from './colorWrap.helper';
import {
  buildCurve,
  easing,
  type EasingFunction,
} from './easingCurves.helper';

export type Stop = {
  color: ColorWrapper;
  at: PercentMeasurement;
};

export type LinearOpts = {
  angle?: LinearDirectionInput;
  stops: Stop[];
  globalAlpha?: number;
};

/**
 * Ellipse or circle sizes (CSS values). Example: "120px 140px" or
 * "closest-side"
 */
export type RadialOpts = {
  size?: string; // default: "farthest-corner"
  at?: string; // e.g. "20% 30%"; default: "50% 50%"
  shape?: 'circle' | 'ellipse'; // default: "ellipse"
  stops: Stop[];
};

export type Layer =
  | { kind: 'linear'; options: LinearOpts }
  | { kind: 'radial'; options: RadialOpts };

export type Built = {
  fallback: string;
  modern: string;
};

type MeasurementValue = IMeasurement | 0;

export type GradientAlphaStop = {
  at: number;
  alpha: number;
  blend?: number;
};

export type GradientSpotStopCurveOptions = {
  count?: number;
  positions?: readonly number[];
  easing?: EasingFunction;
  minAlpha?: number;
  maxAlpha?: number;
  includeZero?: boolean;
  includeOne?: boolean;
};

type GradientSpotStopPresetValue =
  | GradientAlphaStop[]
  | GradientSpotStopCurveOptions;

export type DirectionPoint = {
  x: MeasurementValue;
  y: MeasurementValue;
};

type DirectionVector = {
  from: DirectionPoint;
  to: DirectionPoint;
};

export type LinearDirectionInput = DegMeasurement | DirectionVector;

const measurementValue = (
  value: MeasurementValue,
): number | undefined =>
  typeof value === 'number' ? value : value.getValue();

const resolveCoordinateAngle = (
  input: Extract<
    LinearDirectionInput,
    {
      from: DirectionPoint;
      to: DirectionPoint;
    }
  >,
): number | undefined => {
  const ax = measurementValue(input.from.x);
  const ay = measurementValue(input.from.y);
  const bx = measurementValue(input.to.x);
  const by = measurementValue(input.to.y);
  if (ax == null || ay == null || bx == null || by == null)
    return undefined;

  const dx = bx - ax;
  const dy = by - ay;
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return ((angle % 360) + 360) % 360;
};

const DEFAULT_LINEAR_ANGLE = m(90, 'deg');

const isDirectionVector = (
  input: LinearDirectionInput,
): input is DirectionVector =>
  typeof input === 'object' &&
  input !== null &&
  'from' in input &&
  'to' in input;

export function resolveLinearAngle(
  input?: LinearDirectionInput,
): DegMeasurement {
  if (input == null) return DEFAULT_LINEAR_ANGLE;
  if (isDirectionVector(input)) {
    const result = resolveCoordinateAngle(input);
    if (result == null) throw new Error('Invalid coordinate angle');
    return m(result, 'deg');
  }
  return input;
}

type RequiredSpotStopCurveOptions = {
  count: number;
  positions?: readonly number[];
  easing: EasingFunction;
  minAlpha: number;
  maxAlpha: number;
  includeZero: boolean;
  includeOne: boolean;
};

const defaultSpotStopCurve: RequiredSpotStopCurveOptions = {
  count: 5,
  easing: easing.powerDecay(1.6),
  minAlpha: 0,
  maxAlpha: 1,
  includeZero: true,
  includeOne: true,
};

const generateCurveStops = (
  options?: GradientSpotStopCurveOptions,
): GradientAlphaStop[] => {
  const curve: RequiredSpotStopCurveOptions = {
    ...defaultSpotStopCurve,
    ...(options ?? {}),
  };
  const {
    count,
    positions,
    includeZero,
    includeOne,
    minAlpha,
    maxAlpha,
  } = curve;

  const easingFn = curve.easing;
  const hasCustomPositions =
    Array.isArray(positions) && positions.length >= 2;
  const sampleCount = hasCustomPositions
    ? positions.length
    : Math.max(2, Math.floor(count));
  const samples = buildCurve({
    positions: hasCustomPositions ? positions : undefined,
    samples: sampleCount,
    easing: easingFn,
    includeZero,
    includeOne,
    min: 0,
    max: 1,
  });

  return samples.map(({ position, value }) => {
    const alpha = maxAlpha - (maxAlpha - minAlpha) * value;
    return {
      at: Number(
        clamp(position * 100, 0, 100).toFixed(
          GRADIENT_STOP_PRECISION,
        ),
      ),
      alpha: Number(
        clamp(alpha, minAlpha, maxAlpha).toFixed(
          GRADIENT_ALPHA_PRECISION,
        ),
      ),
    };
  });
};

export const gradientSpotStopPresets = {
  soft: defaultSpotStopCurve,
} as const satisfies Record<string, GradientSpotStopPresetValue>;

export type GradientSpotStopPresetName =
  keyof typeof gradientSpotStopPresets;

export type GradientSpotStopInput =
  | GradientSpotStopCurveOptions
  | GradientAlphaStop[]
  | GradientSpotStopPresetName;

export const resolveGradientSpotStops = (
  stops?: GradientSpotStopInput,
): GradientAlphaStop[] => {
  if (Array.isArray(stops)) {
    return stops;
  }
  if (typeof stops === 'string') {
    const preset = gradientSpotStopPresets[stops];
    if (!preset) {
      throw new Error(`Unknown gradient spot stop preset "${stops}"`);
    }
    if (Array.isArray(preset)) {
      return preset;
    }
    return generateCurveStops(preset);
  }
  if (typeof stops === 'object' && stops) {
    return generateCurveStops(stops);
  }
  return generateCurveStops();
};

const GRADIENT_STOP_PRECISION = 2;
const GRADIENT_ANGLE_PRECISION = 2;
const GRADIENT_ALPHA_PRECISION = 3;

const angleToCss = (angle: DegMeasurement): string =>
  angle.round(GRADIENT_ANGLE_PRECISION).css();

const clampAlpha = (value?: number): number | undefined => {
  if (value == null || Number.isNaN(value)) return undefined;
  const percent = mPercent(value * 100)
    .clamp(mPercent(0), mPercent(100))
    .getValue();
  return Number((percent / 100).toFixed(GRADIENT_ALPHA_PRECISION));
};

const stopPositionCss = (percentage: PercentMeasurement): string =>
  percentage
    .clamp(mPercent(0), mPercent(100))
    .round(GRADIENT_STOP_PRECISION)
    .css();

export function buildLinear({
  angle,
  stops,
  globalAlpha,
}: LinearOpts): Built {
  const direction = angleToCss(resolveLinearAngle(angle)); // always returns something (90° default)
  const targetAlpha = clampAlpha(globalAlpha);
  const withAlpha = (input: ColorWrapper): ColorWrapper =>
    targetAlpha == null ? input : input.alpha(targetAlpha);
  const fStops = stops
    .map(
      (s) =>
        `${colorFallback(withAlpha(s.color))} ${stopPositionCss(s.at)}`,
    )
    .join(', ');
  const mStops = stops
    .map(
      (s) =>
        `${colorModern(withAlpha(s.color))} ${stopPositionCss(s.at)}`,
    )
    .join(', ');
  return {
    fallback: `linear-gradient(${direction}, ${fStops})`,
    modern: `linear-gradient(${direction}, ${mStops})`,
  };
}

export function buildRadial({
  size = 'farthest-corner',
  at = '50% 50%',
  shape = 'ellipse',
  stops,
}: RadialOpts): Built {
  const header = `${shape} ${size} at ${at}`;
  const fStops = stops
    .map((s) => `${colorFallback(s.color)} ${stopPositionCss(s.at)}`)
    .join(', ');
  const mStops = stops
    .map((s) => `${colorModern(s.color)} ${stopPositionCss(s.at)}`)
    .join(', ');
  return {
    fallback: `radial-gradient(${header}, ${fStops})`,
    modern: `radial-gradient(${header}, ${mStops})`,
  };
}

/** Stack multiple layers (top→bottom) into background strings */
export function stackBackground(layers: Layer[]): Built {
  const parts = layers.map((l) =>
    l.kind === 'linear'
      ? buildLinear(l.options)
      : buildRadial(l.options));
  const [
    first,
    ...rest
  ] = parts;
  if (
    first &&
    rest.every(
      (part) =>
        part.fallback === first.fallback &&
        part.modern === first.modern,
    )
  ) {
    return first;
  }
  return {
    fallback: parts.map((p) => p.fallback).join(', '),
    modern: parts.map((p) => p.modern).join(', '),
  };
}

export const OKLCH_SUPPORTS = '(color: oklch(50% 0 0))';

/**
 * Turn a Built into a background-image declaration with OKLCH upgrade
 * via @supports. (No `as const` to avoid TS1355 when values are
 * computed.)
 */
export function gradientAsBgImg(
  built: Built,
  blendMode?: string | string[],
) {
  const bm = Array.isArray(blendMode)
    ? blendMode.join(', ')
    : blendMode;
  const base: {
    backgroundImage: string;
    backgroundBlendMode?: string;
  } = {
    backgroundImage: built.fallback,
  };
  if (bm) {
    base.backgroundBlendMode = bm;
  }

  if (!built.modern.includes('oklch(')) {
    return base;
  }

  return {
    ...base,
    '@supports': {
      [OKLCH_SUPPORTS]: {
        backgroundImage: built.modern,
        ...(bm ? { backgroundBlendMode: bm } : {}),
      },
    },
  };
}

export type MaskSupportStyles = {
  mask: Property.Mask;
  WebkitMask: Property.WebkitMask;
};

export type MaskSupportPartStyles = {
  styles: {
    mask: Property.Mask;
    WebkitMask: Property.WebkitMask;
  };
};

const normalizeMaskColor = (value: string): string =>
  value
    .replace(
      /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0(?:\.0+)?\s*\)/g,
      'transparent',
    )
    .replace(
      /rgb\(\s*0\s+0\s+0\s*\/\s*0(?:\.0+)?\s*\)/g,
      'transparent',
    )
    .replace(
      /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*1(?:\.0+)?\s*\)/g,
      '#000',
    )
    .replace(/rgb\(\s*0\s+0\s+0\s*\/\s*1(?:\.0+)?\s*\)/g, '#000')
    .replace(/rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/g, '#000')
    .replace(/rgb\(\s*0\s+0\s+0\s*\)/g, '#000');

export function maskByLinearGradient(
  options: LinearOpts,
): MaskSupportStyles {
  const alphaStops = options.stops.map((stop) => ({
    ...stop,
    color: color('#000').alpha(stop.color.alpha()),
  }));
  const built = buildLinear({
    angle: options.angle,
    stops: alphaStops,
    globalAlpha: options.globalAlpha,
  });
  const mask = normalizeMaskColor(built.fallback);

  return {
    mask,
    WebkitMask: mask,
  };
}

export function maskByLinearGradientParts(
  options: LinearOpts,
): MaskSupportPartStyles {
  const mask = maskByLinearGradient(options);
  return {
    styles: {
      mask: mask.mask,
      WebkitMask: mask.WebkitMask,
    },
  };
}

/** Utility: build evenly-spaced stops from a list of colors */
export function stopsFromColors(
  colors: ColorWrapper[],
  alpha?: number,
): Stop[] {
  const n = Math.max(1, colors.length - 1);
  return colors.map((c, i) => {
    const pos = (i / n) * 100;
    if (alpha != null)
      return { color: c.alpha(alpha), at: mPercent(pos) };
    return { color: c, at: mPercent(pos) };
  });
}
