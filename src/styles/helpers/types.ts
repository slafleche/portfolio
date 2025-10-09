import * as CSS from 'csstype';
import type { IMeasurement } from './measurement';
import type { Color } from 'chroma-js';
// Many tokens in .ts are objects (e.g., chroma colors, measurement objects)
// that expose a `.css()` method to produce a CSS string on demand.
export type CssLike = { css: () => string };

export type MeasurementLike =
	| { value: number; unit?: string }
	| CssLike
	| string
	| undefined;

export type FontFamilyDef = {
	family: CSS.Property.FontFamily;
	weights: { low: number; high: number };
	spacing?: IMeasurement;
};

export type FontStyles = {
	family?: CSS.Property.FontFamily;
	fontFamily?: CSS.Property.FontFamily;
	size?: CssLike | string | { value: number; unit?: string } | undefined;
	fontWeight?: CSS.Property.FontWeight;
	weight?: CSS.Property.FontWeight;
	semiBold?: CSS.Property.FontWeight;
	spacing?: CssLike | string | { value: number; unit?: string } | undefined;
	color?: CssLike | Color | CSS.Property.Color;
};

/**
 * Font family -> config object:
 *
 * - Texts: optional literal strings to include (useful for hard-coded bits)
 * - Keys: translation keys to resolve from locales (scanned across ALL locales)
 * - Weights: string | string[] (e.g., "400", ["400","700"], "100..900")
 * - Ital: request italics set in addition to roman
 * - Subsets: override default ["latin"] if needed (e.g., ["latin-ext"])
 */
export type FontConfig = {
	texts?: string[];
	keys?: string[]; // <— new
	weights: string | string[];
	ital?: boolean;
	subsets?: string[];
};
