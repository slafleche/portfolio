import type * as CSS from 'csstype';
import type { FontFamilyDef, FontStyles } from './types';
import {
  assertPercentMeasurement,
  hasCssMethod,
  isPercentMeasurement,
  type PercentMeasurement,
} from '../measurementKit';

export type FontCSS = Partial<
  Pick<
    CSS.Properties,
    | 'fontFamily'
    | 'fontSize'
    | 'fontWeight'
    | 'letterSpacing'
    | 'lineHeight'
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
): value is CSS.Property.FontWeight =>
  typeof value === 'string' || typeof value === 'number';

const resolveFontWeight = (
  vars: FontStyles,
): CSS.Property.FontWeight | undefined => {
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
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        'fontStyles: unsupported font weight type. Supply a string/number weight.',
      );
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    throw new Error(
      'fontStyles: missing font weight. Provide `fontWeight`, `weight`, or `weights.default` on your token.',
    );
  }

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
  if (hasCssMethod(vars.spacing)) {
    out.letterSpacing = vars.spacing.css();
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

  if (vars.css && typeof vars.css === 'object') {
    Object.assign(out, vars.css);
  }

  return out;
}

export function relativeFontWeight(
  family: FontFamilyDef,
  percent: PercentMeasurement,
): CSS.Property.FontWeight {
  assertPercentMeasurement(percent, 'relativeFontWeight');
  const { high, low } = family.weights;
  const normalized = percent.toPercentDecimal();
  const value = low + (high - low) * normalized;
  return value as CSS.Property.FontWeight;
}

export function computeFontWeight(
  family: FontFamilyDef,
  percent: PercentMeasurement,
): CSS.Property.FontWeight {
  assertPercentMeasurement(percent, 'computeFontWeight');
  const { high, low } = family.weights;
  const normalized = percent.toPercentDecimal();
  const value = low + (high - low) * normalized;
  return value as CSS.Property.FontWeight;
}

export function fontWeightStyle(
  family: FontFamilyDef,
  percent: PercentMeasurement,
): {
  fontWeight: CSS.Property.FontWeight;
} {
  return {
    fontWeight: computeFontWeight(family, percent),
  };
}

export type FontStyleLayer = FontStyles | null | undefined;

export type ComposeFontStyleOptions = {
  family?: FontFamilyDef | null;
  token?: FontStyles | null;
  weightPercent?: PercentMeasurement | null;
  overrides?: FontStyles | null;
  layers?: FontStyleLayer | FontStyleLayer[];
};

const familyToFontStyles = (family: FontFamilyDef): FontStyles => {
  const styles: FontStyles = {
    fontFamily: family.family,
  };

  if (family.spacing) {
    styles.spacing = family.spacing;
  }

  if (family.offsetToFlushTop) {
    styles.offsetToFlushTop = family.offsetToFlushTop;
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

const isFontFamilyDef = (value: unknown): value is FontFamilyDef => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<FontFamilyDef>;
  return (
    typeof candidate.family === 'string' &&
    typeof candidate.weights === 'object' &&
    candidate.weights !== null &&
    typeof candidate.weights.low === 'number' &&
    typeof candidate.weights.high === 'number'
  );
};

export function composeFontStyles({
  family,
  token,
  weightPercent,
  overrides,
  layers,
}: ComposeFontStyleOptions): FontCSS {
  const merged: FontStyles = {};

  let resolvedFamily = family ?? null;
  if (!resolvedFamily && token && isFontFamilyDef(token)) {
    resolvedFamily = token;
  }

  if (resolvedFamily) {
    addLayer(merged, familyToFontStyles(resolvedFamily));
  }

  if (token) {
    addLayer(merged, token);
  }

  if (Array.isArray(layers)) {
    for (const layer of layers) {
      addLayer(merged, layer);
    }
  } else if (layers) {
    addLayer(merged, layers);
  }

  if (resolvedFamily && isPercentMeasurement(weightPercent)) {
    addLayer(merged, fontWeightStyle(resolvedFamily, weightPercent));
  }

  if (overrides) {
    addLayer(merged, overrides);
  }

  return fontStyles(merged);
}
