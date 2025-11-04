import type * as CSS from 'csstype';
import type {
  ComposeFontStylesConfig,
  FontStyleLayer,
  FontWeightPercentOptions,
} from '../styles/helpers/typography.helpers';
import {
  composeFontStyles,
  computeFontWeight,
} from '../styles/helpers/typography.helpers';
import type { FontFamilyDef } from '../styles/helpers/types';
import { fontFamilies } from './fontFamilies.tokens';
import { m, mPercent } from '../styles/measurementKit';

const MODULE_PATH = 'src/tokens/fontVariants.tokens.ts';

export type FontVariantDefinition = {
  family: FontFamilyDef;
  config?: ComposeFontStylesConfig;
  weights: {
    default: CSS.Property.FontWeight;
    strong: CSS.Property.FontWeight;
  };
  waitForFonts?: readonly string[];
  waitForFontsTimeoutMs?: number;
};

type DefineFontVariantOptions = {
  config?: ComposeFontStylesConfig;
  waitForFonts?: readonly string[];
  waitForFontsTimeoutMs?: number;
  label?: string;
};

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
  config?: ComposeFontStylesConfig,
  label?: string,
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
    base: CSS.Property.FontWeight,
    strong: CSS.Property.FontWeight,
  ): {
    default: CSS.Property.FontWeight;
    strong: CSS.Property.FontWeight;
  } => {
    const toNumber = (
      value: CSS.Property.FontWeight,
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
          adjustedBase = clamped as CSS.Property.FontWeight;
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
          adjustedStrong = clamped as CSS.Property.FontWeight;
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
      const message = `[fontVariants${variantLabel}] Expected weights.default (${resolvedBase}) < weights.strong (${resolvedStrong}). (${MODULE_PATH})`;
      console.error(message);

      const fallbackStrong = Math.min(
        family.weights.high,
        Math.max(resolvedBase + 1, family.weights.strong),
      );
      return {
        default: resolvedBase as CSS.Property.FontWeight,
        strong: fallbackStrong as CSS.Property.FontWeight,
      };
    }

    return {
      default: (typeof resolvedBase === 'number'
        ? resolvedBase
        : base) as CSS.Property.FontWeight,
      strong: (typeof resolvedStrong === 'number'
        ? resolvedStrong
        : strong) as CSS.Property.FontWeight,
    };
  };

  const ordered = enforceWeightOrder(defaultWeight, strongWeight);

  return {
    default: ordered.default,
    strong: ordered.strong,
  };
};

const defineFontVariant = (
  family: FontFamilyDef,
  options: DefineFontVariantOptions = {},
): FontVariantDefinition => {
  const { config, waitForFonts, waitForFontsTimeoutMs, label } =
    options;

  return {
    family,
    config,
    waitForFonts,
    waitForFontsTimeoutMs,
    weights: resolveVariantWeights(family, config, label),
  };
};

export const fontVariants = {
  menu: defineFontVariant(fontFamilies.urbanist, {
    config: {
      overrides: {
        size: m(16),
      },
    },
    waitForFonts: [
      'Urbanist',
    ],
    label: 'menu',
  }),
  hero: defineFontVariant(fontFamilies.urbanist, {
    config: {
      overrides: {
        size: m(45),
        lineHeight: 1.1,
      },
      options: {
        weightPercents: {},
      },
    },
    waitForFonts: [
      'Outfit',
    ],
    label: 'hero',
  }),
  heading: defineFontVariant(fontFamilies.urbanist),
  h1: defineFontVariant(fontFamilies.urbanist, {
    config: {
      overrides: {
        size: m(45),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
    label: 'heading-h1',
  }),
  h2: defineFontVariant(fontFamilies.urbanist, {
    config: {
      overrides: {
        size: m(26),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
    label: 'heading-h2',
  }),
  h3: defineFontVariant(fontFamilies.urbanist, {
    config: {
      overrides: {
        size: m(23),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
    label: 'heading-h3',
  }),
  h4: defineFontVariant(fontFamilies.urbanist, {
    config: {
      overrides: {
        size: m(20),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
    label: 'heading-h4',
  }),
  h5: defineFontVariant(fontFamilies.urbanist, {
    config: {
      overrides: {
        size: m(18),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
    label: 'heading-h5',
  }),
  h6: defineFontVariant(fontFamilies.urbanist, {
    config: {
      overrides: {
        size: m(17),
      },
      options: {
        weightPercents: {
          default: mPercent(100),
        },
      },
    },
    label: 'heading-h6',
  }),
  body: defineFontVariant(fontFamilies.ibm, {
    config: {
      overrides: {
        size: m(16),
        lineHeight: 1,
      },
      options: {
        weightPercents: {
          default: mPercent(0),
          strong: mPercent(100),
        },
      },
    },
    label: 'body',
  }),
} as const satisfies Record<string, FontVariantDefinition>;

export type FontVariantKey = keyof typeof fontVariants;

export function getFontVariant<Key extends FontVariantKey>(
  key: Key,
): (typeof fontVariants)[Key] {
  return fontVariants[key];
}

export function composeFontVariantStyles(
  variant: FontVariantDefinition,
  extraConfig?: ComposeFontStylesConfig,
) {
  const config = combineConfig(variant.config, extraConfig);
  return composeFontStyles(variant.family, config);
}
