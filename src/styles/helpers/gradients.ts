import {
	color,
	type ColorWrapper,
	type CuloriOKLCH,
} from './colorWrap';
import type { IMeasurement } from './measurement';
import { isCssLike } from './measurement';
import {
	buildCurve,
	easing,
	type EasingFunction,
} from './easingCurves';

/** OKLCH tuple (percents for L, chroma as 0..~0.4, hue in degrees) */
export type OKLCH = {
	l: number;
	c: number;
	h: number;
	a?: number;
};
export type ColorInput = OKLCH | string | ColorWrapper; // supports wrapped theme colors

export type Stop = {
	color: ColorInput;
	/** Position as %, 0..100 (number OR string "40%" accepted) */
	at: number | string;
};

export type AngleInput = number | IMeasurement;

export type LinearOpts = {
	angle?: AngleInput;
	stops: Stop[];
};

export type RadialOpts = {
	/**
	 * Ellipse or circle sizes (CSS values). Example: "120px 140px" or
	 * "closest-side"
	 */
	size?: string; // default: "farthest-corner"
	at?: string; // e.g. "20% 30%"; default: "50% 50%"
	shape?: 'circle' | 'ellipse'; // default: "ellipse"
	stops: Stop[];
};

export type Layer =
	| { kind: 'linear'; options: LinearOpts }
	| { kind: 'radial'; options: RadialOpts };

export type Built = {
	fallback: string;
	modern: string;
};

const pct = (p: number | string) =>
	typeof p === 'number' ? `${p}%` : p;

type MeasurementValue = number | IMeasurement;

export type GradientAlphaStop = {
	at: number;
	alpha: number;
	blend?: number;
};

type NamedGradientEasing =
	| { name: 'linear' }
	| { name: 'easeOutQuad' }
	| { name: 'easeOutCubic' }
	| { name: 'powerDecay'; exponent?: number };

export type GradientSpotStopCurveOptions = {
	count?: number;
	positions?: readonly number[];
	easing?: NamedGradientEasing | EasingFunction;
	minAlpha?: number;
	maxAlpha?: number;
	includeZero?: boolean;
	includeOne?: boolean;
};

type GradientSpotStopPresetValue =
	| GradientAlphaStop[]
	| GradientSpotStopCurveOptions;

export type DirectionPoint = {
	x: MeasurementValue;
	y: MeasurementValue;
};

export type LinearDirectionInput =
	| AngleInput
	| {
			from: DirectionPoint;
			to: DirectionPoint;
	  };

const measurementValue = (
	value: MeasurementValue,
): number | undefined =>
	typeof value === 'number' ? value : value.value;

const resolveCoordinateAngle = (
	input: Extract<
		LinearDirectionInput,
		{
			from: DirectionPoint;
			to: DirectionPoint;
		}
	>,
): number | undefined => {
	const ax = measurementValue(input.from.x);
	const ay = measurementValue(input.from.y);
	const bx = measurementValue(input.to.x);
	const by = measurementValue(input.to.y);
	if (ax == null || ay == null || bx == null || by == null)
		return undefined;

	const dx = bx - ax;
	const dy = by - ay;
	const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
	return ((angle % 360) + 360) % 360;
};

export function resolveLinearAngle(
	input?: LinearDirectionInput,
): AngleInput {
	if (input == null) return 90; // default
	if (typeof input === 'number') return input;
	if (isCssLike(input)) return input;
	if ('from' in input && 'to' in input) {
		const result = resolveCoordinateAngle(input);
		if (result == null) throw new Error('Invalid coordinate angle');
		return result;
	}
	throw new Error('Invalid linear angle input');
}

function isColorWrapper(value: unknown): value is ColorWrapper {
	return (
		typeof value === 'object' &&
		value !== null &&
		'unsafeColor' in (value as Record<string, unknown>)
	);
}

/** Format OKLCH -> CSS oklch() */
function fmtOKLCH({ l, c, h, a }: OKLCH): string {
	const L = `${clamp(l, 0, 100).toFixed(3)}%`;
	const C = clamp(c, 0, 0.4).toFixed(4); // practical range
	const H = ((h % 360) + 360) % 360;
	const A = a == null ? '' : ` / ${clamp(a, 0, 1)}`;
	return `oklch(${L} ${C} ${H}${A})`;
}

/**
 * Approximate OKLCH -> sRGB using LCH as a stand-in (close enough for
 * UI gradients).
 */
function oklchToRgbString({ l, c, h, a }: OKLCH): string {
	const normalized: CuloriOKLCH = {
		mode: 'oklch',
		l: clamp(l, 0, 100) / 100,
		c: clamp(c, 0, 0.4),
		h: ((h % 360) + 360) % 360,
		alpha: a ?? 1,
	};
	return color.fromOKLCH(normalized).css(); // rely on your wrapper's output
}

function isOKLCH(x: ColorInput): x is OKLCH {
	return (
		typeof x === 'object' &&
		x != null &&
		'l' in x &&
		'c' in x &&
		'h' in x
	);
}

function toModernOKLCH(input: ColorInput): OKLCH | undefined {
	if (isOKLCH(input)) return input;
	const source = isColorWrapper(input)
		? input
		: typeof input === 'string'
			? input
			: undefined;
	if (!source) return undefined;
const culori = color.toOKLCH(source);
	if (!culori) return undefined;
	return {
		l: culori.l * 100,
		c: culori.c,
		h: culori.h ?? 0,
		a: culori.alpha,
	};
}

type RequiredSpotStopCurveOptions = {
	count: number;
	positions?: readonly number[];
	easing: NamedGradientEasing | EasingFunction;
	minAlpha: number;
	maxAlpha: number;
	includeZero: boolean;
	includeOne: boolean;
};

const defaultSpotStopCurve: RequiredSpotStopCurveOptions = {
	count: 5,
	easing: { name: 'powerDecay', exponent: 1.6 },
	minAlpha: 0,
	maxAlpha: 1,
	includeZero: true,
	includeOne: true,
};

const resolveEasingOption = (
	option: NamedGradientEasing | EasingFunction,
): EasingFunction => {
	if (typeof option === 'function') {
		return option;
	}
	switch (option.name) {
		case 'linear':
			return easing.linear;
		case 'easeOutQuad':
			return easing.easeOutQuad;
		case 'easeOutCubic':
			return easing.easeOutCubic;
		case 'powerDecay':
		default:
			return easing.powerDecay(option.exponent);
	}
};

const generateCurveStops = (
	options?: GradientSpotStopCurveOptions,
): GradientAlphaStop[] => {
	const curve: RequiredSpotStopCurveOptions = {
		...defaultSpotStopCurve,
		...(options ?? {}),
	};
	const {
		count,
		positions,
		includeZero,
		includeOne,
		minAlpha,
		maxAlpha,
	} = curve;

	const easingFn = resolveEasingOption(curve.easing);
	const hasCustomPositions = Array.isArray(positions) && positions.length >= 2;
	const sampleCount = hasCustomPositions
		? positions.length
		: Math.max(2, Math.floor(count));
	const samples = buildCurve({
		positions: hasCustomPositions ? positions : undefined,
		samples: sampleCount,
		easing: easingFn,
		includeZero,
		includeOne,
		min: 0,
		max: 1,
	});

	return samples.map(({ position, value }) => {
		const alpha =
			maxAlpha - (maxAlpha - minAlpha) * value;
		return {
			at: Math.round(clamp(position * 100, 0, 100)),
			alpha: Number(clamp(alpha, minAlpha, maxAlpha).toFixed(3)),
		};
	});
};

export const gradientSpotStopPresets = {
	soft: defaultSpotStopCurve,
} as const satisfies Record<string, GradientSpotStopPresetValue>;

export type GradientSpotStopPresetName =
	keyof typeof gradientSpotStopPresets;

export type GradientSpotStopInput =
	| GradientSpotStopCurveOptions
	| GradientAlphaStop[]
	| GradientSpotStopPresetName;

export const resolveGradientSpotStops = (
	stops?: GradientSpotStopInput,
): GradientAlphaStop[] => {
	if (Array.isArray(stops)) {
		return stops;
	}
	if (typeof stops === 'string') {
		const preset = gradientSpotStopPresets[stops];
		if (!preset) {
			throw new Error(`Unknown gradient spot stop preset "${stops}"`);
		}
		if (Array.isArray(preset)) {
			return preset;
		}
		return generateCurveStops(preset);
	}
	if (typeof stops === 'object' && stops) {
		return generateCurveStops(stops);
	}
	return generateCurveStops();
};

function colorFallback(c: ColorInput): string {
	if (isColorWrapper(c)) return c.css();
	if (isOKLCH(c)) return oklchToRgbString(c);
	return c;
}

function colorModern(c: ColorInput): string {
	const oklch = toModernOKLCH(c);
	if (oklch) return fmtOKLCH(oklch);
	return colorFallback(c);
}

const angleToCss = (angle: AngleInput): string =>
	typeof angle === 'number' ? `${angle}deg` : angle.css();

// accept number | IMeasurement | { from, to }
export function buildLinear({
	angle,
	stops,
}: {
	angle?: LinearDirectionInput;
	stops: Stop[];
}): Built {
	const direction = angleToCss(resolveLinearAngle(angle)); // always returns something (90° default)
	const fStops = stops
		.map((s) => `${colorFallback(s.color)} ${pct(s.at)}`)
		.join(', ');
	const mStops = stops
		.map((s) => `${colorModern(s.color)} ${pct(s.at)}`)
		.join(', ');
	return {
		fallback: `linear-gradient(${direction}, ${fStops})`,
		modern: `linear-gradient(${direction}, ${mStops})`,
	};
}

export function buildRadial({
	size = 'farthest-corner',
	at = '50% 50%',
	shape = 'ellipse',
	stops,
}: RadialOpts): Built {
	const header = `${shape} ${size} at ${at}`;
	const fStops = stops
		.map((s) => `${colorFallback(s.color)} ${pct(s.at)}`)
		.join(', ');
	const mStops = stops
		.map((s) => `${colorModern(s.color)} ${pct(s.at)}`)
		.join(', ');
	return {
		fallback: `radial-gradient(${header}, ${fStops})`,
		modern: `radial-gradient(${header}, ${mStops})`,
	};
}

/** Stack multiple layers (top→bottom) into background strings */
export function stackBackground(layers: Layer[]): Built {
	const parts = layers.map((l) =>
		l.kind === 'linear'
			? buildLinear(l.options)
			: buildRadial(l.options),
	);
	return {
		fallback: parts.map((p) => p.fallback).join(', '),
		modern: parts.map((p) => p.modern).join(', '),
	};
}

/* ========================================================================== */
/*                          VANILLA-EXTRACT HELPERS                           */
/* ========================================================================== */

export const OKLCH_SUPPORTS = '(color: oklch(50% 0 0))';

/**
 * Turn a Built into a background-image declaration with OKLCH upgrade
 * via @supports. (No `as const` to avoid TS1355 when values are
 * computed.)
 */
export function backgroundImageDecl(
	built: Built,
	blendMode?: string | string[],
) {
	const bm = Array.isArray(blendMode)
		? blendMode.join(', ')
		: blendMode;
	const base: {
		backgroundImage: string;
		backgroundBlendMode?: string;
	} = {
		backgroundImage: built.fallback,
	};
	if (bm) {
		base.backgroundBlendMode = bm;
	}

	return {
		...base,
		'@supports': {
			[OKLCH_SUPPORTS]: {
				backgroundImage: built.modern,
				...(bm ? { backgroundBlendMode: bm } : {}),
			},
		},
	};
}

/**
 * Compose color + image in one go (keeps @supports only for the
 * image).
 */
export function backgroundDecl(opts: {
	color?: string; // plain color string
	image?: Built; // from buildLinear/buildRadial/stackBackground
	blendMode?: string | string[];
}) {
	const { color: bgColor, image, blendMode } = opts;
	const base: Record<string, unknown> = {};
	if (bgColor) base.backgroundColor = bgColor;
	if (!image) return base;

	return {
		...base,
		...backgroundImageDecl(image, blendMode),
	};
}

/** Utility: build evenly-spaced stops from a list of colors */
export function stopsFromColors(
	colors: ColorInput[],
	alpha?: number,
): Stop[] {
	const n = Math.max(1, colors.length - 1);
	return colors.map((c, i) => {
		const pos = (i / n) * 100;
		if (isOKLCH(c) && alpha != null)
			return { color: { ...c, a: alpha }, at: pos };
		if (isColorWrapper(c) && alpha != null)
			return { color: c.alpha(alpha), at: pos };
		return { color: c, at: pos };
	});
}

function clamp(v: number, min: number, max: number) {
	return Math.max(min, Math.min(max, v));
}
