import {
	color,
	type ColorWrapper,
	type CuloriOKLCH,
} from './colorWrap';
import type { IMeasurement } from './measurement';
import { isCssLike } from './measurement';

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
	angle: AngleInput;
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
	| {
			kind: 'linear';
			options: LinearOpts;
	  }
	| {
			kind: 'radial';
			options: RadialOpts;
	  };

export type Built = {
	fallback: string;
	modern: string;
};

const pct = (p: number | string) =>
	typeof p === 'number' ? `${p}%` : p;

type MeasurementValue = number | IMeasurement;

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

const measurementValue = (value: MeasurementValue): number | undefined =>
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
	if (
		ax == null ||
		ay == null ||
		bx == null ||
		by == null
	) {
		return undefined;
	}

	const dx = bx - ax;
	const dy = by - ay;
	const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
	return (angle % 360 + 360) % 360;
};

export function resolveLinearAngle(
	input?: LinearDirectionInput,
): AngleInput | undefined {
	if (input == null) return 270; // default "to left"
	if (typeof input === 'number') return input;
	if (isCssLike(input)) {
		return input;
	}
	if ('from' in input && 'to' in input) {
		return resolveCoordinateAngle(input as {
			from: DirectionPoint;
			to: DirectionPoint;
		});
	}
	return undefined;
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
	return color.fromOKLCH(normalized).css();
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

export function buildLinear({ angle, stops }: LinearOpts): Built {
	const direction = angleToCss(angle);
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

/**
 * Optional convenience: set fallback first, then upgrade if OKLCH
 * supported
 */
export function applyBackground(
	el: HTMLElement,
	layers: Layer[],
	blendModes?: string[], // e.g. ["screen","multiply","normal"]
): void {
	const built = stackBackground(layers);
	el.style.background = built.fallback;
	if (blendModes?.length)
		el.style.backgroundBlendMode = blendModes.join(', ');
	if (CSS.supports('color', 'oklch(50% 0 0)')) {
		el.style.background = built.modern;
	}
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
			return {
				color: { ...c, a: alpha },
				at: pos,
			};
		if (isColorWrapper(c) && alpha != null)
			return {
				color: c.alpha(alpha),
				at: pos,
			};
		return { color: c, at: pos };
	});
}

function clamp(v: number, min: number, max: number) {
	return Math.max(min, Math.min(max, v));
}
