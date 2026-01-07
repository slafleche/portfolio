import type {
  CSS_TYPES,
  FontFamilyDef,
  FontFamilyForPercentWeights,
  FontStyles,
} from '@/styles/helpers/types.helper';
import {
  hasCssMethod,
  isPercentMeasurement,
  type IMeasurement,
  type PercentMeasurement,
} from 'css-calipers';
import { percentToDecimal } from '../../lib/math';
import { notRelease } from '../../lib/runtimeEnv';
import type { FontVariantDefinition } from './fontVariant.helper';

const typographyWarning = (message: string): void => {
  const prefixed = `[Typography] ${message}`;

  if (notRelease()) {
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
  >
>;

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
  const normalized = percentToDecimal(percent);
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
  default?: PercentMeasurement | null;
  strong?: PercentMeasurement | null;
};

export type ComposeFontStylesOptions = {
  textAlign?: CSS_TYPES.Property.TextAlign | null;
  textTransform?: CSS_TYPES.Property.TextTransform | null;
  letterSpacing?: IMeasurement | null;
  weightPercents?: FontWeightPercentOptions | null;
};

export type ComposeFontStylesConfig = {
  options?: ComposeFontStylesOptions | null;
  overrides?: FontStyleLayer;
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
  const { overrides, layers, options } = config;

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

  if (overrides) {
    addLayer(merged, overrides);
  }

  return fontStyles(merged);
}
