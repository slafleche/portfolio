import { color, type ColorWrapper } from './colorWrap';
import type { Property } from 'csstype';
import {
	buildLinear,
	resolveLinearAngle,
	stackBackground,
	type Layer,
	type LinearDirectionInput,
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
	/**
	 * Number of interior samples inserted between each pair of spot
	 * stops. Accepts integers ≥ 0.
	 */
	extrasPerSpan?: number;
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
	/**
	 * Optional blend factor (0–1) controlling how strongly this stop
	 * pulls the interpolated color toward itself. Similar to the linear
	 * stop `blend`.
	 */
	blend?: number;
};

const pctLerp = (a: number, b: number, t: number) => a + (b - a) * t;
const interiorPercents = (p1: number, p2: number, n: number) =>
	Array.from({ length: n }, (_, i) =>
		pctLerp(p1, p2, (i + 1) / (n + 1)),
	);
const clampPercent = (value: number) =>
	Math.max(0, Math.min(100, value));
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const formatSpotPosition = ({ x, y }: GradientSpot) => `${x}% ${y}%`;
const normalizeScalePercentPair = (scale?: number) => {
	const pct = Math.max(0, scale ?? 100);
	return `${pct}% ${pct}%`;
};
const formatSpotSize = (spot: GradientSpot) =>
	normalizeScalePercentPair(spot.scale);
const ensureAlpha = (value: ColorWrapper) =>
	color.wrap(value.css({ forceAlpha: true }));
const defaultSpotStops: SpotStop[] = [
	{
		at: 0,
		alpha: 1,
	},
	{
		at: 100,
		alpha: 0,
	},
];

const sanitizeSpotStops = (stops?: SpotStop[]): SpotStop[] => {
	if (!stops?.length) {
		return defaultSpotStops;
	}

	const sanitized = stops
		.map(({ at, alpha }) => ({
			at: clampPercent(at),
			alpha: clamp01(alpha),
		}))
		.sort((a, b) => a.at - b.at);

	return sanitized.length < 2 ? defaultSpotStops : sanitized;
};

const getSpotAnchors = (spot: GradientSpot) => {
	const stops = sanitizeSpotStops(spot.stops);
	return {
		percents: stops.map((stop) => stop.at),
		alphas: stops.map((stop) => stop.alpha),
		blends: stops.map((stop) => clamp01(stop.blend ?? 0)),
	};
};

function radialStopsAlphaFade(
	base: ColorWrapper,
	anchorPercents: number[],
	anchorAlphas: number[],
	anchorBlends: number[],
	extrasPerSpan = 1,
	softenL = 0,
): Stop[] {
	const normalizedBase = ensureAlpha(base);
	const baseAlpha = clamp01(
		base.alpha?.() ?? normalizedBase.alpha?.() ?? 1,
	);
	const [
		L,
		C,
		H,
	] = normalizedBase.value().lch();
	const make = (alpha: number) =>
		color.lch(L + softenL, C, H).alpha(alpha);

	const anchors = anchorPercents.map((p, i) => {
		const relativeAlpha = clamp01(anchorAlphas[i]);
		const absoluteAlpha = clamp01(baseAlpha * relativeAlpha);
		return {
			p,
			relativeAlpha,
			alpha: absoluteAlpha,
			blend: clamp01(anchorBlends[i] ?? 0),
			color: ensureAlpha(make(absoluteAlpha)),
		};
	});

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
			let midColor = make(alpha);
			const blendPrev = clamp01(A.blend * (1 - t));
			const blendNext = clamp01(B.blend * t);
			midColor = ensureAlpha(midColor);
			if (blendPrev > 0) {
				midColor = ensureAlpha(
					midColor.mix(A.color, blendPrev, 'oklab'),
				);
			}
			if (blendNext > 0) {
				midColor = ensureAlpha(
					midColor.mix(B.color, blendNext, 'oklab'),
				);
			}
			out.push({
				color: midColor,
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
			color: ensureAlpha(color),
			at,
		}));
	}

	const ordered = slices
		.map(({ color, ...rest }) => ({
			...rest,
			color: ensureAlpha(color),
		}))
		.sort((a, b) => a.at - b.at);

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
				color: ensureAlpha(mid),
				at: mids[j],
			});
		}
	}

	out.push({
		color: ensureAlpha(ordered.at(-1)!.color),
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
		 * Linear gradient direction. Accepts an angle (number or
		 * measurement), a CSS angle string like `"45deg"`, or start/end
		 * percentage coordinates. When omitted defaults to 90 (equivalent
		 * to `"to right"` in CSS).
		 */
		linearDirection?: LinearDirectionInput;
		/**
		 * Fallback angle when blend modes are unavailable. Defaults to
		 * the same value as `linearDirection` if unspecified.
		 */
		linearFallbackDirection?: LinearDirectionInput;
		/**
		 * Whether to include the linear gradient layer. Useful for
		 * debugging spot layers without the base wash.
		 */
		includeLinear?: boolean;
		/**
		 * Whether to render spot overlays. Disable to focus on the linear
		 * gradient when debugging.
		 */
		includeSpots?: boolean;
	} = {},
) {
	const {
		extrasPerSpan = 1,
		softenL = 0,
		linearDirection,
		linearFallbackDirection,
		includeLinear = true,
		includeSpots = true,
	} = options;

	const linearAngle = resolveLinearAngle(linearDirection) ?? 90;
	const fallbackAngle =
		resolveLinearAngle(linearFallbackDirection ?? linearDirection) ??
		90;

	const linearSlices = Array.isArray(gradient.linear)
		? gradient.linear
		: [];
	const hasLinear = includeLinear && linearSlices.length > 0;
	const linearStops = hasLinear
		? linearStopsLab(linearSlices, extrasPerSpan)
		: [];
	const layers: Layer[] = [];
	const blendModes: Property.MixBlendMode[] = [];

	const spots = includeSpots ? (gradient.spots ?? []) : [];

	if (includeSpots) {
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
						anchors.blends,
						spot.extrasPerSpan ?? extrasPerSpan,
						spot.softenL ?? softenL,
					),
				},
			});
			blendModes.push(spot.blendMode ?? 'screen');
		}
	}

	if (hasLinear) {
		const linearOptions = {
			stops: linearStops,
			angle: linearAngle,
		};
		layers.push({
			kind: 'linear',
			options: linearOptions,
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
				stops: linearStops,
				angle: fallbackAngle,
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
