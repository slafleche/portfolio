export type EasingFunction = (t: number) => number;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const easing = {
  linear: (t: number) => clamp01(t),
  easeOutQuad: (t: number) => {
    const x = clamp01(t);
    return 1 - (1 - x) * (1 - x);
  },
  easeOutCubic: (t: number) => {
    const x = clamp01(t);
    return 1 - (1 - x) * (1 - x) * (1 - x);
  },
  powerDecay:
    (exponent = 1.6): EasingFunction =>
    (t: number) => {
      const x = clamp01(t);
      return 1 - Math.pow(1 - x, exponent);
    },
} as const;

export type BuildCurveOptions = {
  positions?: readonly number[];
  samples?: number;
  easing?: EasingFunction;
  min?: number;
  max?: number;
  includeZero?: boolean;
  includeOne?: boolean;
};

export type CurveSample = {
  position: number;
  value: number;
};

export const buildCurve = (
  options: BuildCurveOptions = {},
): CurveSample[] => {
  const {
    positions,
    samples = 5,
    easing: ease = easing.linear,
    min = 0,
    max = 1,
    includeZero = true,
    includeOne = true,
  } = options;

  let source: number[];
  if (positions && positions.length >= 2) {
    source = Array.from(positions)
      .map((p) => clamp01(p))
      .sort((a, b) => a - b);
  } else {
    const count = Math.max(2, Math.floor(samples));
    const steps = count - 1;
    const start = includeZero ? 0 : 1 / (steps + 2);
    const end = includeOne ? 1 : steps / (steps + 2);
    source = Array.from({ length: count }, (_, index) =>
      count === 1 ? 0.5 : start + ((end - start) * index) / steps,
    ).map((value) => clamp01(value));
  }

  return source.map((position) => {
    const eased = clamp01(ease(position));
    const value = min + (max - min) * eased;
    return {
      position: Number(position.toFixed(4)),
      value: Number(value.toFixed(4)),
    };
  });
};
