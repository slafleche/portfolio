/**
 * Wrapper helpers for chroma.js colors with OKLCH conversion utilities.
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
 *
 * We also piggyback on Culori to convert to/from OKLCH without giving up the
 * familiar chroma manipulation APIs. The `color` helper exposes
 * `toOKLCH`/`fromOKLCH` so gradients and other utilities can opt into modern
 * color spaces when needed while keeping sRGB fallbacks.
 */
import chroma, { type Color } from 'chroma-js';
import { converter, formatCss, type Oklch } from 'culori';
export type { Color } from 'chroma-js';

type MixArgs = Parameters<Color['mix']>;

export type ColorWrapper = {
	unsafeColor: Color;
	css: () => string;
	alpha: {
		(): number;
		(value: number): ColorWrapper;
	};
	darken: (value?: number) => ColorWrapper;
	brighten: (value?: number) => ColorWrapper;
	saturate: (value?: number) => ColorWrapper;
	desaturate: (value?: number) => ColorWrapper;
	mix: (target: ColorInput, ratio?: number, mode?: MixArgs[2]) => ColorWrapper;
	mixSolid: (
		target: ColorInput,
		ratio?: number,
		mode?: MixArgs[2],
	) => ColorWrapper;
	clone: () => ColorWrapper;
	value: () => Color;
	solid: () => ColorWrapper;
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

const clampRatio = (ratio?: number) =>
	ratio === undefined ? undefined : Math.max(0, Math.min(1, ratio));

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

export type CuloriOKLCH = Oklch;

const toCuloriOKLCH = converter('oklch');
const fromCuloriOKLCH = converter('rgb');

const colorToCuloriOklch = (input: ColorInput): CuloriOKLCH | undefined => {
	const base = toColor(input);
	const converted = toCuloriOKLCH(base.css()) as Oklch | null;
	if (!converted) {
		return undefined;
	}
	return {
		mode: 'oklch',
		l: converted.l,
		c: converted.c,
		h: converted.h,
		alpha: converted.alpha,
	};
};

const culoriOklchToWrapper = (value: CuloriOKLCH): ColorWrapper => {
	const converted = fromCuloriOKLCH(value);
	if (!converted) {
		throw new Error('Unable to convert OKLCH color to sRGB');
	}
	const css = formatCss(converted);
	if (!css) {
		throw new Error('Failed to format converted sRGB color');
	}
	return wrap(css);
};

export function wrap(input: ColorInput): ColorWrapper {
	const base = toColor(input);
	const alpha = ((value?: number) => {
		if (value === undefined) {
			return base.alpha();
		}
		return derive(base, (draft) => draft.alpha(value));
	}) as ColorWrapper['alpha'];

	return {
		unsafeColor: base,
		css: () => base.css(),
		alpha,
		darken: (value?: number) => derive(base, (draft) => draft.darken(value)),
		brighten: (value?: number) =>
			derive(base, (draft) => draft.brighten(value)),
		saturate: (value?: number) =>
			derive(base, (draft) => draft.saturate(value)),
		desaturate: (value?: number) =>
			derive(base, (draft) => draft.desaturate(value)),
		mix: (target: ColorInput, ratio?: number, mode?: MixArgs[2]) =>
			derive(base, (draft) =>
				draft.mix(toColor(target), clampRatio(ratio), mode),
			),
		mixSolid: (target: ColorInput, ratio?: number, mode?: MixArgs[2]) =>
			derive(base, (draft) =>
				draft
					.alpha(1)
					.mix(toColor(target), clampRatio(ratio), mode),
			),
		clone: () => wrap(cloneColor(base)),
		value: () => cloneColor(base),
		solid: () => derive(base, (draft) => draft.alpha(1)),
	};
}

export const color = Object.assign((input: ColorInput) => wrap(input), {
	wrap,
	from: wrap,
	unsafeChroma: chroma,
	unsafeToColor: toColor,
	toOKLCH: (input: ColorInput) => colorToCuloriOklch(input),
	fromOKLCH: (value: CuloriOKLCH) => culoriOklchToWrapper(value),
	oklch: (value: CuloriOKLCH) => culoriOklchToWrapper(value),
	scale: (stops: ColorInput[]): ChromaScale => createScale(stops),
	lch: (l: number, c: number, h: number) => wrap(chroma.lch(l, c, h)),
	fromCss: (value: string) => wrap(value),
});

export const mixWithAlpha = (
	base: ColorWrapper,
	target: ColorInput,
	ratio: number,
	alpha?: number,
): ColorWrapper => {
	const desiredAlpha = alpha ?? base.alpha();
	return base.mixSolid(target, ratio).alpha(desiredAlpha);
};
