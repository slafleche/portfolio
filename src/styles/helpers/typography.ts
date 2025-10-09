import type * as CSS from 'csstype';
import type { FontFamilyDef } from './types';
import type { FontStyles } from './types';
import { isCssLike } from './measurement';

export type FontCSS = Partial<{
	fontFamily: CSS.Property.FontFamily;
	fontSize: CSS.Property.FontSize;
	fontWeight: CSS.Property.FontWeight;
	letterSpacing: CSS.Property.LetterSpacing;
}>;

/** Normalize your FontStyles tokens into CSS-ready properties only */
export function fontCSSFrom(vars: FontStyles): FontCSS {
	const out: FontCSS = {};

	// family / fontFamily -> fontFamily
	if (vars.family) out.fontFamily = vars.family;
	if (vars.fontFamily) out.fontFamily = vars.fontFamily;

	// tokens with .css()
	if (isCssLike(vars.size))
		out.fontSize = vars.size.css() as CSS.Property.FontSize;
	if (isCssLike(vars.spacing)) {
		out.letterSpacing = vars.spacing.css() as CSS.Property.LetterSpacing;
	}

	// weight (either field may exist)
	if (vars.fontWeight) out.fontWeight = vars.fontWeight;
	if (vars.weight) out.fontWeight = vars.weight;

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
): { fontWeight: CSS.Property.FontWeight } {
	const { high, low } = family.weights;
	const normalized = normalizeWeight(percent);
	const value = low + (high - low) * normalized;
	return { fontWeight: value as CSS.Property.FontWeight };
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
): { fontWeight: CSS.Property.FontWeight } {
	return { fontWeight: computeFontWeight(family, percent) };
}
