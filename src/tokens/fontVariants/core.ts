import type {
  ComposeFontStylesConfig,
  FontStyleLayer,
  FontWeightPercentOptions,
} from '../../styles/helpers/typography.helper';
import {
  composeFontStyles,
  computeFontWeight,
} from '../../styles/helpers/typography.helper';
import type {
  FontFamilyDef,
  CSS,
} from '../../styles/helpers/types.helper';

export type FontVariantDefinition = {
  family: FontFamilyDef;
  config?: ComposeFontStylesConfig;
  weights: {
    default: CSS_TYPES.Property.FontWeight;
    strong: CSS_TYPES.Property.FontWeight;
  };
  waitForFonts?: readonly string[];
  waitForFontsTimeoutMs?: number;
};

export type DefineFontVariantOptions = {
  config?: ComposeFontStylesConfig;
  waitForFonts?: readonly string[];
  waitForFontsTimeoutMs?: number;
  label?: string;
  sourcePath?: string;
};

const DEFAULT_SOURCE = 'src/tokens/fontVariants';

const mergeWeightPercents = (
  ...sources: Array<FontWeightPercentOptions | null | undefined>
): FontWeightPercentOptions | undefined => {
  const merged: FontWeightPercentOptions = {};

  for (const source of sources) {
    if (!source) continue;
    if (source.default) merged.default = source.default;
    if (source.strong) merged.strong = source.strong;
  }

  if (merged.default || merged.strong) {
    return merged;
  }

  return undefined;
};

const collectLayers = (
  config?: ComposeFontStylesConfig,
  includeOverrides = false,
): FontStyleLayer[] => {
  if (!config) return [];
  const layers: FontStyleLayer[] = [];
  const { layers: configLayers, overrides } = config;

  if (Array.isArray(configLayers)) {
    layers.push(...configLayers);
  } else if (configLayers) {
    layers.push(configLayers);
  }

  if (includeOverrides && overrides) {
    layers.push(overrides);
  }

  return layers;
};

const combineConfig = (
  base?: ComposeFontStylesConfig,
  extra?: ComposeFontStylesConfig,
): ComposeFontStylesConfig | undefined => {
  if (!base && !extra) return undefined;
  if (!base) return extra;
  if (!extra) return base;

  const mergedLayers: FontStyleLayer[] = [
    ...collectLayers(base, true),
    ...collectLayers(extra, false),
  ];

  const mergedOptions =
    mergeWeightPercents(
      base.options?.weightPercents,
      extra.options?.weightPercents,
    ) ?? undefined;

  const options =
    mergedOptions !== undefined
      ? {
          weightPercents: mergedOptions,
        }
      : undefined;

  const overrides = extra.overrides ?? undefined;

  return {
    options,
    layers: mergedLayers.length > 0 ? mergedLayers : undefined,
    overrides,
  };
};

const resolveVariantWeights = (
  family: FontFamilyDef,
  config: ComposeFontStylesConfig | undefined,
  label: string | undefined,
  sourcePath: string,
): FontVariantDefinition['weights'] => {
  const weightPercents = config?.options?.weightPercents;
  const hasStrongOverride = weightPercents?.strong != null;

  const defaultWeight =
    weightPercents?.default != null
      ? computeFontWeight(family, weightPercents.default)
      : family.weights.default;

  const strongWeight =
    weightPercents?.strong != null
      ? computeFontWeight(family, weightPercents.strong)
      : family.weights.strong;

  const enforceWeightOrder = (
    base: CSS_TYPES.Property.FontWeight,
    strong: CSS_TYPES.Property.FontWeight,
  ): {
    default: CSS_TYPES.Property.FontWeight;
    strong: CSS_TYPES.Property.FontWeight;
  } => {
    const toNumber = (
      value: CSS_TYPES.Property.FontWeight,
    ): number | undefined => {
      if (typeof value === 'number') return value;
      const normalized = value.toString().trim().toLowerCase();
      if (normalized === 'normal') return 400;
      if (normalized === 'bold') return 700;
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const clamp = (value: number): number => {
      return Math.min(
        family.weights.high,
        Math.max(family.weights.low, value),
      );
    };

    const baseNumber = toNumber(base);
    const strongNumber = toNumber(strong);
    let adjustedBase = baseNumber ?? base;
    let adjustedStrong = strongNumber ?? strong;

    if (baseNumber !== undefined) {
      if (
        baseNumber < family.weights.low ||
        baseNumber > family.weights.high
      ) {
        const message = `fontVariants: default font weight for "${family.family}" (${baseNumber}) should stay within [${family.weights.low}, ${family.weights.high}].`;
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(message);
        }
        console.warn(message);
        const clamped = clamp(baseNumber);
        if (clamped !== baseNumber) {
          adjustedBase = clamped as CSS_TYPES.Property.FontWeight;
        }
      }
    }

    if (strongNumber !== undefined) {
      if (
        strongNumber < family.weights.low ||
        strongNumber > family.weights.high
      ) {
        const message = `fontVariants: strong font weight for "${family.family}" (${strongNumber}) should stay within [${family.weights.low}, ${family.weights.high}].`;
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(message);
        }
        console.warn(message);
        const clamped = clamp(strongNumber);
        if (clamped !== strongNumber) {
          adjustedStrong = clamped as CSS_TYPES.Property.FontWeight;
        }
      }
    }

    const resolvedBase =
      (typeof adjustedBase === 'number'
        ? adjustedBase
        : baseNumber) ?? family.weights.default;
    const resolvedStrong =
      (typeof adjustedStrong === 'number'
        ? adjustedStrong
        : strongNumber) ?? family.weights.strong;

    if (
      typeof resolvedBase === 'number' &&
      typeof resolvedStrong === 'number' &&
      hasStrongOverride &&
      resolvedBase >= resolvedStrong
    ) {
      const variantLabel = label ? `.${label}` : '';
      const message = `[fontVariants${variantLabel}] Expected weights.default (${resolvedBase}) < weights.strong (${resolvedStrong}). (${sourcePath})`;
      console.error(message);

      const fallbackStrong = Math.min(
        family.weights.high,
        Math.max(resolvedBase + 1, family.weights.strong),
      );
      return {
        default: resolvedBase as CSS_TYPES.Property.FontWeight,
        strong: fallbackStrong as CSS_TYPES.Property.FontWeight,
      };
    }

    return {
      default: (typeof resolvedBase === 'number'
        ? resolvedBase
        : base) as CSS_TYPES.Property.FontWeight,
      strong: (typeof resolvedStrong === 'number'
        ? resolvedStrong
        : strong) as CSS_TYPES.Property.FontWeight,
    };
  };

  return enforceWeightOrder(defaultWeight, strongWeight);
};

export const defineFontVariant = (
  family: FontFamilyDef,
  options: DefineFontVariantOptions = {},
): FontVariantDefinition => {
  const {
    config,
    waitForFonts,
    waitForFontsTimeoutMs,
    label,
    sourcePath = DEFAULT_SOURCE,
  } = options;

  return {
    family,
    config,
    waitForFonts,
    waitForFontsTimeoutMs,
    weights: resolveVariantWeights(family, config, label, sourcePath),
  };
};

export function composeFontVariantStyles(
  variant: FontVariantDefinition,
  extraConfig?: ComposeFontStylesConfig,
) {
  const config = combineConfig(variant.config, extraConfig);
  return composeFontStyles(variant.family, config);
}

export type FontVariantMap = Record<string, FontVariantDefinition>;
