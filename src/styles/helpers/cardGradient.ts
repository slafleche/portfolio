import { color, type ColorWrapper } from './colorWrap';
import type { Property } from 'csstype';
import type { IMeasurement } from './measurement';
import { isCssLike } from './measurement';
import {
	buildLinear,
	stackBackground,
	type Layer,
	type Stop,
} from './gradients';

type LinearGradientStop = {
	color: ColorWrapper;
	/** Stop position as a percentage (0–100). */
	at: number;
	/**
	 * Optional neighbor blend factor (0–1). Increasing this value pulls
	 * interpolated midpoint colors closer to this stop's color,
	 * producing a softer transition around the stop.
	 */
	blend?: number;
};

/**
 * Radial accent configuration.
 *
 * `x`/`y` coordinates are expressed as percentages (0–100) of the
 * target box.
 */
type GradientSpot = {
	color: ColorWrapper;
	x: number;
	y: number;
	/**
	 * Optional lightness offset for this spot, overrides the global
	 * softenL.
	 */
	softenL?: number;
	/** Diameter scaling percentage (100 = base size). */
	scale?: number;
	/** Optional blend mode for this spot layer (default: "screen"). */
	blendMode?: Property.MixBlendMode;
	/** Optional custom stop definitions for the radial fade. */
	stops?: SpotStop[];
};

type CardGradientPack = {
	linear?: LinearGradientStop[] | null;
	spots?: GradientSpot[];
};

type SpotStop = {
	at: number;
	alpha: number;
};

type MeasurementValue = number | IMeasurement;
type DirectionPoint = {
	x: MeasurementValue;
	y: MeasurementValue;
};

type LinearDirectionInput =
	| string
	| IMeasurement
	| {
			from: DirectionPoint;
			to: DirectionPoint;
	  };

const pctLerp = (a: number, b: number, t: number) => a + (b - a) * t;
const interiorPercents = (p1: number, p2: number, n: number) =>
	Array.from({ length: n }, (_, i) =>
		pctLerp(p1, p2, (i + 1) / (n + 1)),
	);
const clampPercent = (value: number) =>
	Math.max(0, Math.min(100, value));
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const formatSpotPosition = ({ x, y }: GradientSpot) =>
	`${clampPercent(x)}% ${clampPercent(y)}%`;
const normalizeScalePercentPair = (scale?: number) => {
	const pct = Math.max(0, scale ?? 100);
	return `${pct}% ${pct}%`;
};
const formatSpotSize = (spot: GradientSpot) =>
	normalizeScalePercentPair(spot.scale);
const formatCoordinate = (value: MeasurementValue) =>
	typeof value === 'number' ? `${clampPercent(value)}%` : value.css();
const formatPoint = ({ x, y }: DirectionPoint) =>
	`${formatCoordinate(x)} ${formatCoordinate(y)}`;
const formatLinearDirection = (
	input?: LinearDirectionInput,
): string => {
	if (typeof input === 'string') {
		return input;
	}
	if (input && isCssLike(input)) {
		return input.css();
	}
	if (input) {
		return `${formatPoint(input.from)}, ${formatPoint(input.to)}`;
	}
	// default equivalent of "to left"
	return '100% 50%, 0% 50%';
};
const defaultSpotStops: SpotStop[] = [
	{
		at: 0,
		alpha: 1,
	},
	{
		at: 25,
		alpha: 0.82,
	},
	{
		at: 45,
		alpha: 0.55,
	},
	{
		at: 65,
		alpha: 0.28,
	},
	{
		at: 90,
		alpha: 0,
	},
];

const sanitizeSpotStops = (stops?: SpotStop[]): SpotStop[] => {
	if (!stops?.length) return defaultSpotStops;

	const sanitized = stops
		.map(({ at, alpha }) => ({
			at: clampPercent(at),
			alpha: clamp01(alpha),
		}))
		.sort((a, b) => a.at - b.at);

	if (sanitized.length < 2) {
		return defaultSpotStops;
	}

	return sanitized;
};

const getSpotAnchors = (spot: GradientSpot) => {
	const stops = sanitizeSpotStops(spot.stops);
	return {
		percents: stops.map((stop) => stop.at),
		alphas: stops.map((stop) => stop.alpha),
	};
};

function radialStopsAlphaFade(
	base: ColorWrapper,
	anchorPercents: number[],
	anchorAlphas: number[],
	extrasPerSpan = 1,
	softenL = 0,
): Stop[] {
	const [
		L,
		C,
		H,
	] = base.value().lch();
	const make = (alpha: number) =>
		color.lch(L + softenL, C, H).alpha(alpha);

	const anchors = anchorPercents.map((p, i) => ({
		p,
		alpha: anchorAlphas[i],
		color: make(anchorAlphas[i]),
	}));
	const out: Stop[] = [];

	for (let i = 0; i < anchors.length - 1; i++) {
		const A = anchors[i];
		const B = anchors[i + 1];
		out.push({
			color: A.color,
			at: A.p,
		});
		const mids = interiorPercents(A.p, B.p, extrasPerSpan);
		for (let j = 0; j < mids.length; j++) {
			const t = (j + 1) / (extrasPerSpan + 1);
			const alpha = A.alpha + t * (B.alpha - A.alpha);
			out.push({
				color: make(alpha),
				at: mids[j],
			});
		}
	}
	const last = anchors.at(-1)!;
	out.push({
		color: last.color,
		at: last.p,
	});
	return out;
}

function linearStopsLab(
	slices: LinearGradientStop[],
	extrasPerSpan = 1,
): Stop[] {
	if (slices.length < 2) {
		return slices.map(({ color, at }) => ({
			color,
			at,
		}));
	}

	const ordered = slices.slice().sort((a, b) => a.at - b.at);

	const out: Stop[] = [];
	for (let i = 0; i < ordered.length - 1; i++) {
		const current = ordered[i];
		const next = ordered[i + 1];
		const start = current.at;
		const end = next.at;
		out.push({
			color: current.color,
			at: start,
		});
		const mids = interiorPercents(start, end, extrasPerSpan);
		const scale = color
			.scale([
				current.color,
				next.color,
			])
			.mode('oklab');
		const blendCurrent = clamp01(current.blend ?? 0);
		const blendNext = clamp01(next.blend ?? 0);
		for (let j = 0; j < mids.length; j++) {
			const t = (j + 1) / (extrasPerSpan + 1);
			let mid = color.wrap(scale(t));
			if (blendCurrent > 0) {
				const weightCurrent = clamp01(blendCurrent * (1 - t));
				if (weightCurrent > 0) {
					mid = mid.mix(current.color, weightCurrent, 'oklab');
				}
			}
			if (blendNext > 0) {
				const weightNext = clamp01(blendNext * t);
				if (weightNext > 0) {
					mid = mid.mix(next.color, weightNext, 'oklab');
				}
			}
			out.push({
				color: mid,
				at: mids[j],
			});
		}
	}

	out.push({
		color: ordered.at(-1)!.color,
		at: ordered.at(-1)!.at,
	});
	return out;
}

export function makeCardGradient(
	gradient: CardGradientPack,
	options: {
		/**
		 * Number of interior samples inserted between each pair of stops.
		 * Accepts integers ≥ 0.
		 */
		extrasPerSpan?: number;
		/**
		 * Default lightness offset applied to radial spot colors (OKLCH)
		 * before alpha fading. Expressed as OKLCH L units (roughly
		 * 0–100). Individual spots can override via `spot.softenL`.
		 */
		softenL?: number;
		/**
		 * Linear gradient direction. Accepts either a CSS direction
		 * string (`"to left"`, `"45deg"`) or start/end percentage
		 * coordinates. When omitted defaults to the percentage equivalent
		 * of `"to left"`.
		 */
		linearDirection?: LinearDirectionInput;
		/**
		 * Fallback direction when blend modes are unavailable. Defaults
		 * to the same value as `linearDirection` if unspecified.
		 */
		linearFallbackDirection?: LinearDirectionInput;
		/**
		 * Whether to include the linear gradient layer. Useful for
		 * debugging spot layers without the base wash.
		 */
		includeLinear?: boolean;
	} = {},
) {
	const {
		extrasPerSpan = 1,
		softenL = 0,
		linearDirection,
		linearFallbackDirection,
		includeLinear = true,
	} = options;

	const formattedLinearDirection =
		formatLinearDirection(linearDirection);
	const formattedFallbackDirection = formatLinearDirection(
		linearFallbackDirection ?? linearDirection,
	);

	const linearSlices = Array.isArray(gradient.linear)
		? gradient.linear
		: [];
	const hasLinear = includeLinear && linearSlices.length > 0;
	const linearStops = hasLinear
		? linearStopsLab(linearSlices, extrasPerSpan)
		: [];
	const layers: Layer[] = [];
	const blendModes: Property.MixBlendMode[] = [];

	const spots = gradient.spots ?? [];

	for (const spot of spots) {
		const anchors = getSpotAnchors(spot);
		layers.push({
			kind: 'radial',
			options: {
				shape: 'ellipse', // use equal radii to model a circle while keeping browser-compatible syntax
				size: formatSpotSize(spot),
				at: formatSpotPosition(spot),
				stops: radialStopsAlphaFade(
					spot.color,
					anchors.percents,
					anchors.alphas,
					extrasPerSpan,
					spot.softenL ?? softenL,
				),
			},
		});
		blendModes.push(spot.blendMode ?? 'screen');
	}

	if (hasLinear) {
		layers.push({
			kind: 'linear',
			options: {
				to: formattedLinearDirection,
				stops: linearStops,
			},
		});
		blendModes.push('normal');
	}

	/* Example additional spot layers
	const secondSpot = gradient.spots[1] ?? gradient.spots[0];
	if (secondSpot) {
		// {
		//   kind: 'radial',
		//   options: {
		//     shape: 'ellipse',
		//     size: formatSpotSize(gradient.spots[1] ?? gradient.spots[0]),
		//     at: formatSpotPosition(gradient.spots[1] ?? gradient.spots[0]),
		//     stops: radialStopsAlphaFade(
		//       (gradient.spots[1] ?? gradient.spots[0]).color,
		//       [0, 30],
		//       [0.6, 0.0],
		//       0,
		//       (gradient.spots[1] ?? gradient.spots[0]).softenL ?? softenL,
		//     ),
		//   },
		// },
	}
	*/

	const gradientStack = stackBackground(layers);
	const linearFallback = hasLinear
		? buildLinear({
				to: formattedFallbackDirection,
				stops: linearStops,
			})
		: undefined;

	const blendModeValue =
		blendModes.length > 0 ? blendModes.join(', ') : undefined;

	const baseResult: Record<string, unknown> = {
		backgroundImage: gradientStack.fallback,
	};
	if (blendModeValue) {
		baseResult.backgroundBlendMode = blendModeValue;
	}

	const supportsColor: Record<string, unknown> = {
		backgroundImage: gradientStack.modern,
	};
	if (blendModeValue) {
		supportsColor.backgroundBlendMode = blendModeValue;
	}

	const supportsNoBlend = hasLinear
		? {
				backgroundImage: linearFallback!.fallback,
				backgroundBlendMode: 'normal',
			}
		: {
				backgroundImage: gradientStack.fallback,
			};

	return {
		...baseResult,
		'@supports': {
			'(color: oklch(50% 0 0))': supportsColor,
			'not (background-blend-mode: overlay)': supportsNoBlend,
		},
	};
}
