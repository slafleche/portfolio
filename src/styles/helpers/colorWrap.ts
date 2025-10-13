/**
 * Wrapper helpers for chroma.js colors.
 *
 * Chroma Color instances are mutable: calling mutator methods such as `.alpha`,
 * `.darken`, `.saturate`, etc. modifies the same object in place. When a single
 * color value (e.g. `colorVars.contrast`) is shared across the codebase, those
 * in-place mutations lead to surprising side effects—for example, another part
 * of the app suddenly receives a transparent version of the "contrast" color.
 *
 * This module provides an immutable façade (`ColorWrapper`) that clones the
 * underlying color before applying any modification, so every chained modifier
 * works on an isolated copy. The original chroma color remains unchanged until
 * a caller explicitly invokes `.css()` or `.value()`.
 */
import chroma, { type Color } from 'chroma-js';
export type { Color } from 'chroma-js';

type MixArgs = Parameters<Color['mix']>;

export type ColorWrapper = {
	unsafeColor: Color;
	css: () => string;
	alpha: (value: number) => ColorWrapper;
	darken: (value?: number) => ColorWrapper;
	brighten: (value?: number) => ColorWrapper;
	saturate: (value?: number) => ColorWrapper;
	desaturate: (value?: number) => ColorWrapper;
	mix: (
		target: ColorInput,
		ratio?: MixArgs[1],
		mode?: MixArgs[2],
	) => ColorWrapper;
	clone: () => ColorWrapper;
	value: () => Color;
};

type ColorInput = Color | ColorWrapper | string;

const isColorWrapper = (value: ColorInput): value is ColorWrapper =>
	typeof value === 'object' && value !== null && 'unsafeColor' in value;

const toColor = (input: ColorInput): Color => {
	if (typeof input === 'string') {
		return chroma(input);
	}
	return isColorWrapper(input) ? input.unsafeColor : input;
};

const cloneColor = (source: Color): Color => chroma(source.css());

const derive = (
	source: Color,
	modifier: (draft: Color) => Color,
): ColorWrapper => {
	const draft = cloneColor(source);
	const next = modifier(draft);
	return wrap(next);
};

type ChromaScale = ReturnType<typeof chroma.scale>;

const createScale = (stops: ColorInput[]): ChromaScale =>
	chroma.scale(stops.map((stop) => toColor(stop)));

export function wrap(input: ColorInput): ColorWrapper {
	const base = toColor(input);
	return {
		unsafeColor: base,
		css: () => base.css(),
		alpha: (value: number) => derive(base, (draft) => draft.alpha(value)),
		darken: (value?: number) => derive(base, (draft) => draft.darken(value)),
		brighten: (value?: number) =>
			derive(base, (draft) => draft.brighten(value)),
		saturate: (value?: number) =>
			derive(base, (draft) => draft.saturate(value)),
		desaturate: (value?: number) =>
			derive(base, (draft) => draft.desaturate(value)),
		mix: (target: ColorInput, ratio?: MixArgs[1], mode?: MixArgs[2]) =>
			derive(base, (draft) => draft.mix(toColor(target), ratio, mode)),
		clone: () => wrap(cloneColor(base)),
		value: () => cloneColor(base),
	};
}

export const color = Object.assign((input: ColorInput) => wrap(input), {
	wrap,
	from: wrap,
	unsafeChroma: chroma,
	unsafeToColor: toColor,
	scale: (stops: ColorInput[]): ChromaScale => createScale(stops),
	lch: (l: number, c: number, h: number) => wrap(chroma.lch(l, c, h)),
	fromCss: (value: string) => wrap(value),
});
