// Many tokens in .ts are objects (e.g., chroma colors, measurement objects)
// that expose a `.css()` method to produce a CSS string on demand.
export type CssLike = { css: () => string };

export type MeasurementLike =
	| { value: number; unit?: string }
	| CssLike
	| string
	| undefined;
