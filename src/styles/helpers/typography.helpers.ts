import type * as CSS from 'csstype';
import type { FontFamilyDef, FontStyles } from './types';
import { hasCssMethod } from './measurement';

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
  if (vars.fontWeight) out.fontWeight = vars.fontWeight;
  if (vars.weight) out.fontWeight = vars.weight;

  if (vars.css && typeof vars.css === 'object') {
    Object.assign(out, vars.css);
  }

  return out;
}

const normalizeWeight = (weightPercentage: number) => {
  if (weightPercentage < 0 || weightPercentage > 100) {
    throw new Error(`Bad value for font weight: ${weightPercentage}`);
  }
  return weightPercentage / 100;
};

export function fontWeight(
  family: FontFamilyDef,
  percent: number,
): CSS.Property.FontWeight {
  const { high, low } = family.weights;
  const normalized = normalizeWeight(percent);
  const value = low + (high - low) * normalized;
  return value as CSS.Property.FontWeight;
}

export function computeFontWeight(
  family: FontFamilyDef,
  percent: number,
): CSS.Property.FontWeight {
  const { high, low } = family.weights;
  const normalized = normalizeWeight(percent);
  const value = low + (high - low) * normalized;
  return value as CSS.Property.FontWeight;
}

export function fontWeightStyle(
  family: FontFamilyDef,
  percent: number,
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
  weightPercent?: number | null;
  overrides?: FontStyles | null;
  layers?: FontStyleLayer | FontStyleLayer[];
};

const validNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

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

  if (resolvedFamily && validNumber(weightPercent)) {
    addLayer(merged, fontWeightStyle(resolvedFamily, weightPercent));
  }

  if (overrides) {
    addLayer(merged, overrides);
  }

  return fontStyles(merged);
}
