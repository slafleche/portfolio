import {
  hasCssMethod,
  type IMeasurement,
  isPercentMeasurement,
  type PercentMeasurement,
} from 'css-calipers';

import type {
  CSS_TYPES,
  FontFamilyDef,
  FontFamilyForPercentWeights,
  FontStyles,
} from '@/styles/helpers/types.helper';

import * as math from '../../lib/math';
import * as runtimeEnv from '../../lib/runtimeEnv';

const typographyWarning = (message: string): void => {
  const prefixed = `[Typography] ${message}`;

  if (runtimeEnv.notRelease()) {
    throw new Error(prefixed);
  }
  console.warn(prefixed);
};

export type FontCSS = Partial<
  Pick<
    CSS_TYPES.Properties,
    | 'fontFamily'
    | 'fontSize'
    | 'fontWeight'
    | 'letterSpacing'
    | 'lineHeight'
    | 'textAlign'
    | 'textTransform'
    | 'fontVariationSettings'
    | 'fontStretch'
    | 'fontStyle'
    | 'fontFeatureSettings'
    | 'fontKerning'
    | 'fontOpticalSizing'
    | 'marginTop'
    | 'marginBottom'
    | 'paddingTop'
  >
>;

export type FontVariantDefinition<
  Family extends
    | FontFamilyDef
    | FontFamilyForPercentWeights = FontFamilyDef,
> = {
  family: Family;
  config?: ComposeFontStylesConfig;
  weights: {
    default: CSS_TYPES.Property.FontWeight;
    strong: CSS_TYPES.Property.FontWeight;
  };
  waitForFonts?: readonly string[];
  waitForFontsTimeoutMs?: number;
};

type WaitForFontsInput = readonly string[] | true;

export type DefineFontVariantOptions = {
  config?: ComposeFontStylesConfig;
  waitForFonts?: WaitForFontsInput;
  waitForFontsTimeoutMs?: number;
  label?: string;
  sourcePath?: string;
};

const DEFAULT_SOURCE = 'src/tokens/fontVariants';

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

  const resolvedWaitForFonts =
    waitForFonts === true
      ? ((): readonly string[] | undefined => {
          const primaryName = resolvePrimaryFamilyName(family);
          return primaryName
            ? [
                primaryName,
              ]
            : undefined;
        })()
      : waitForFonts;

  return {
    family,
    config,
    waitForFonts: resolvedWaitForFonts,
    waitForFontsTimeoutMs,
    weights: resolveVariantWeights(family, config, label, sourcePath),
  };
};

const resolvePrimaryFamilyName = (
  family: FontFamilyDef,
): string | undefined => {
  const raw = family.family.split(',')[0]?.trim();
  if (!raw) return undefined;
  if (raw.startsWith('"') && raw.endsWith('"') && raw.length > 1) {
    return raw.slice(1, -1);
  }
  return raw;
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
  const { layers: configLayers, styleOverrides: overrides } = config;

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

  const mergedWeightPercents =
    mergeWeightPercents(
      base.options?.weightPercents,
      extra.options?.weightPercents,
    ) ?? undefined;

  const resolveOptionValue = <
    K extends keyof ComposeFontStylesOptions,
  >(
    key: K,
  ): ComposeFontStylesOptions[K] | undefined => {
    if (
      extra.options &&
      Object.prototype.hasOwnProperty.call(extra.options, key)
    ) {
      return extra.options[key];
    }
    return base.options?.[key];
  };

  const options: ComposeFontStylesOptions = {
    textAlign: resolveOptionValue('textAlign'),
    textTransform: resolveOptionValue('textTransform'),
    letterSpacing: resolveOptionValue('letterSpacing'),
    offsetToFlushTop: resolveOptionValue('offsetToFlushTop'),
    offsetBottom: resolveOptionValue('offsetBottom'),
    paddingTop: resolveOptionValue('paddingTop'),
    weightPercents: mergedWeightPercents,
  };

  const overrides = extra.styleOverrides ?? undefined;

  return {
    options,
    layers: mergedLayers.length > 0 ? mergedLayers : undefined,
    styleOverrides: overrides,
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
        if (runtimeEnv.notRelease()) {
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
        if (runtimeEnv.notRelease()) {
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

// const fontVariants = {
//   ...menuVariants,
//   ...heroVariants,
//   ...headingVariants,
//   ...bodyVariants,
// } as const satisfies Record<string, FontVariantDefinition>;

// export type FontVariantKey = keyof typeof fontVariants;

// export function getFontVariant<Key extends FontVariantKey>(
//   key: Key,
// ): (typeof fontVariants)[Key] {
//   return fontVariants[key];
// }

// type ComposeVariantConfig = Parameters<
//   typeof fontStylesFromFontVariant
// >[1];

// export function fontVariantStyles<Key extends FontVariantKey>(
//   key: Key,
//   extraConfig?: ComposeVariantConfig,
// ) {
//   return fontStylesFromFontVariant(fontVariants[key], extraConfig);
// }

// export { fontStylesFromFontVariant as fontStylesFromFontVariant };
// export type { FontVariantDefinition };

type FontVariantStylesOptions = {
  variant: FontVariantDefinition;
  extraConfig?: ComposeFontStylesConfig;
  baseVariant?: FontVariantDefinition;
  includeFontMargins?: boolean;
};

type FontVariantMarginOptions = Omit<
  FontVariantStylesOptions,
  'includeFontMargins'
>;

export function fontStylesFromFontVariant({
  variant,
  extraConfig,
  baseVariant,
  includeFontMargins = false,
}: FontVariantStylesOptions): Partial<
  Pick<
    CSS_TYPES.Properties<0 | (string & {}), string & {}>,
    | 'fontFamily'
    | 'fontFeatureSettings'
    | 'fontKerning'
    | 'fontOpticalSizing'
    | 'fontSize'
    | 'fontStyle'
    | 'fontVariationSettings'
    | 'fontWeight'
    | 'letterSpacing'
    | 'lineHeight'
    | 'marginBottom'
    | 'marginTop'
    | 'textAlign'
    | 'textTransform'
    | 'fontStretch'
  >
> {
  const withBase = baseVariant
    ? combineConfig(baseVariant.config, variant.config)
    : variant.config;
  const config = combineConfig(withBase, extraConfig);
  const styles = composeFontStyles(variant.family, config);
  if (includeFontMargins) {
    const offsetToFlushTop =
      config?.options?.offsetToFlushTop ??
      variant.family.offsetToFlushTop;
    const offsetBottom =
      config?.options?.offsetBottom ?? variant.family.offsetBottom;
    if (offsetToFlushTop) {
      styles.marginTop = offsetToFlushTop.css();
    }
    if (offsetBottom) {
      styles.marginBottom = offsetBottom.css();
    }
  }
  return styles;
}

export function fontMarginsFromFontVariant(
  options: FontVariantMarginOptions,
): Partial<
  Pick<
    CSS_TYPES.Properties<0 | (string & {}), string & {}>,
    'marginBottom' | 'marginTop'
  >
> {
  const styles = fontStylesFromFontVariant({
    ...options,
    includeFontMargins: true,
  });
  const margins: Partial<
    Pick<
      CSS_TYPES.Properties<0 | (string & {}), string & {}>,
      'marginBottom' | 'marginTop'
    >
  > = {};
  if (styles.marginTop !== undefined) {
    margins.marginTop = styles.marginTop;
  }
  if (styles.marginBottom !== undefined) {
    margins.marginBottom = styles.marginBottom;
  }
  return margins;
}

export type FontVariantMap = Record<string, FontVariantDefinition>;

const isFontWeightValue = (
  value: unknown,
): value is CSS_TYPES.Property.FontWeight =>
  typeof value === 'string' || typeof value === 'number';

const resolveFontWeight = (
  vars: FontStyles,
): CSS_TYPES.Property.FontWeight | undefined => {
  if (isFontWeightValue(vars.fontWeight)) {
    return vars.fontWeight;
  }

  if (isFontWeightValue(vars.weight)) {
    return vars.weight;
  }

  const defaultWeight = vars.weights?.default;
  if (isFontWeightValue(defaultWeight)) {
    return defaultWeight;
  }

  if (
    vars.fontWeight !== undefined ||
    vars.weight !== undefined ||
    defaultWeight !== undefined
  ) {
    typographyWarning(
      'fontStyles: unsupported font weight type. Supply a string/number weight.',
    );
  }

  typographyWarning(
    'fontStyles: missing font weight. Provide `fontWeight`, `weight`, or `weights.default` on your token.',
  );

  return undefined;
};

/** Normalize your FontStyles tokens into CSS-ready properties only */
export function fontStyles(vars: FontStyles): FontCSS {
  const out: FontCSS = {};

  // family / fontFamily -> fontFamily
  if (vars.family) out.fontFamily = vars.family;
  if (vars.fontFamily) out.fontFamily = vars.fontFamily;

  // tokens with .css()
  if (hasCssMethod(vars.size)) out.fontSize = vars.size.css();
  if (hasCssMethod(vars.letterSpacing)) {
    out.letterSpacing = vars.letterSpacing.css();
  }
  if (vars.lineHeight !== undefined) {
    out.lineHeight = hasCssMethod(vars.lineHeight)
      ? vars.lineHeight.css()
      : vars.lineHeight;
  }
  if (hasCssMethod(vars.paddingTop)) {
    out.paddingTop = vars.paddingTop.css();
  }

  // weight (either field may exist)
  const normalizedWeight = resolveFontWeight(vars);
  if (normalizedWeight !== undefined)
    out.fontWeight = normalizedWeight;

  if (vars.textAlign) out.textAlign = vars.textAlign;
  if (vars.textTransform) out.textTransform = vars.textTransform;

  if (vars.css && typeof vars.css === 'object') {
    Object.assign(out, vars.css);
  }

  return out;
}

type RelativeFontWeightInput =
  | FontFamilyForPercentWeights
  | FontVariantDefinition<FontFamilyForPercentWeights>;

export function relativeFontWeight(
  fontFamily: RelativeFontWeightInput,
  percent: PercentMeasurement,
) {
  if (!isPercentMeasurement(percent)) {
    throw new TypeError(
      '[Typography] relativeFontWeight expected a PercentMeasurement.',
    );
  }
  const targetFont = (
    typeof fontFamily.family === 'string'
      ? fontFamily
      : fontFamily.family
  ) as FontFamilyForPercentWeights;
  return {
    fontWeight: computeFontWeight(targetFont, percent),
  };
}

export function computeFontWeight(
  family: FontFamilyForPercentWeights,
  percent: PercentMeasurement,
): CSS_TYPES.Property.FontWeight {
  if (!isPercentMeasurement(percent)) {
    throw new TypeError(
      '[Typography] computeFontWeight expected a PercentMeasurement.',
    );
  }
  const { default: base, strong } = family.weights;
  if (!Number.isFinite(base) || !Number.isFinite(strong)) {
    throw new TypeError(
      '[Typography] computeFontWeight expected numeric weights.default and weights.strong.',
    );
  }
  const weights = family.weights as FontFamilyDef['weights'];
  const low = Number.isFinite(weights.low) ? weights.low : base;
  const high = Number.isFinite(weights.high) ? weights.high : strong;
  const normalized = math.percentToDecimal(percent);
  const value = low + (high - low) * normalized;
  const rounded = Math.round(value / 100) * 100;
  const clamped = Math.min(rounded, high);
  return clamped as CSS_TYPES.Property.FontWeight;
}

export function fontWeightStyle(
  family: FontFamilyDef,
  percent: PercentMeasurement,
): {
  fontWeight: CSS_TYPES.Property.FontWeight;
} {
  return {
    fontWeight: computeFontWeight(family, percent),
  };
}

export type FontStyleLayer = FontStyles | null | undefined;

export type FontWeightPercentOptions = {
  default?: PercentMeasurement;
  strong?: PercentMeasurement;
};

export type ComposeFontStylesOptions = {
  textAlign?: CSS_TYPES.Property.TextAlign;
  textTransform?: CSS_TYPES.Property.TextTransform;
  letterSpacing?: IMeasurement;
  offsetToFlushTop?: IMeasurement;
  paddingTop?: IMeasurement;
  offsetBottom?: IMeasurement;
  weightPercents?: FontWeightPercentOptions;
};

export type ComposeFontStylesConfig = {
  options?: ComposeFontStylesOptions;
  styleOverrides?: FontStyleLayer;
  layers?: FontStyleLayer | FontStyleLayer[];
};

const familyToFontStyles = (family: FontFamilyDef): FontStyles => {
  const styles: FontStyles = {
    familyDef: family,
    fontFamily: family.family,
    fontWeight: family.weights.default,
    textAlign: family.textAlign,
    textTransform: family.textTransform,
    letterSpacing: family.letterSpacing,
    offsetBottom: family.offsetBottom,
    weights: {
      default: family.weights.default,
      strong: family.weights.strong,
    },
  };

  if (family.letterSpacing) {
    styles.letterSpacing = family.letterSpacing;
  }

  if (family.offsetToFlushTop) {
    styles.offsetToFlushTop = family.offsetToFlushTop;
  }

  if (family.offsetBottom) {
    styles.offsetBottom = family.offsetBottom;
  }

  if (family.lineHeight !== undefined) {
    styles.lineHeight = family.lineHeight;
  }

  if (family.css) {
    styles.css = {
      ...family.css,
    };
  }

  return styles;
};

const addLayer = (target: FontStyles, layer: FontStyleLayer) => {
  if (!layer) return;
  const { css, ...rest } = layer;
  Object.assign(target, rest);
  if (css) {
    target.css = {
      ...(target.css ?? {}),
      ...css,
    };
  }
};

const applyWeightPercents = (
  family: FontFamilyDef,
  merged: FontStyles,
  weights?: FontWeightPercentOptions | null,
) => {
  if (!weights) return;
  const nextWeights = {
    default: merged.weights?.default ?? family.weights.default,
    strong: merged.weights?.strong ?? family.weights.strong,
  };

  if (weights.default) {
    const computed = computeFontWeight(family, weights.default);
    merged.fontWeight = computed;
    nextWeights.default = computed;
  }

  if (weights.strong) {
    const computed = computeFontWeight(family, weights.strong);
    nextWeights.strong = computed;
  }

  merged.weights = nextWeights;
};

export function composeFontStyles(
  family: FontFamilyDef,
  config: ComposeFontStylesConfig = {},
): FontCSS {
  const merged: FontStyles = familyToFontStyles(family);
  const { styleOverrides: overrides, layers, options } = config;

  if (Array.isArray(layers)) {
    for (const layer of layers) {
      addLayer(merged, layer);
    }
  } else if (layers) {
    addLayer(merged, layers);
  }

  applyWeightPercents(
    family,
    merged,
    options?.weightPercents ?? null,
  );

  if (options?.textAlign) {
    merged.textAlign = options.textAlign;
  }
  if (options?.textTransform) {
    merged.textTransform = options.textTransform;
  }
  if (options?.letterSpacing != null) {
    merged.letterSpacing = options.letterSpacing;
  }

  if (options?.paddingTop != null) {
    merged.paddingTop = options.paddingTop;
  }

  if (overrides) {
    addLayer(merged, overrides);
  }

  return fontStyles(merged);
}
