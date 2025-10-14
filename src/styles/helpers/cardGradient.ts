import { color, type ColorWrapper } from './colorWrap';
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
	 * interpolated midpoint colors closer to this stop's color, producing a
	 * softer transition around the stop.
	 */
	blend?: number;
};

/**
 * Radial accent configuration.
 *
 * `x`/`y` coordinates are expressed as percentages (0–100) of the target box.
 */
type GradientSpot = {
	color: ColorWrapper;
	x: number;
	y: number;
	/** Optional lightness offset for this spot, overrides the global softenL. */
	softenL?: number;
};

type CardGradientPack = {
	linear: LinearGradientStop[];
	spots: GradientSpot[];
};

const pctLerp = (a: number, b: number, t: number) => a + (b - a) * t;
const interiorPercents = (p1: number, p2: number, n: number) =>
	Array.from({ length: n }, (_, i) =>
		pctLerp(p1, p2, (i + 1) / (n + 1)),
	);
const clampPercent = (value: number) =>
	Math.max(0, Math.min(100, value));
const clamp01 = (value: number) =>
	Math.max(0, Math.min(1, value));
const formatSpotPosition = ({ x, y }: GradientSpot) =>
	`${clampPercent(x)}% ${clampPercent(y)}%`;

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
					mid = mid.mix(
						current.color,
						weightCurrent,
						'oklab',
					);
				}
			}
			if (blendNext > 0) {
				const weightNext = clamp01(blendNext * t);
				if (weightNext > 0) {
					mid = mid.mix(
						next.color,
						weightNext,
						'oklab',
					);
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
		 * Default lightness offset applied to radial spot colors (OKLCH) before alpha
		 * fading. Expressed as OKLCH L units (roughly 0–100). Individual spots can
		 * override via `spot.softenL`.
		 */
		softenL?: number;
		/**
		 * CSS direction string for the layered linear gradient (e.g. `"to left"`).
		 */
		linearDirection?: string;
		/**
		 * Fallback CSS direction when blend modes are unavailable.
		 */
		linearFallbackDirection?: string;
	} = {},
) {
	const {
		extrasPerSpan = 1,
		softenL = 0,
		linearDirection = 'to left',
		linearFallbackDirection = 'to bottom',
	} = options;

	const linearStops = linearStopsLab(gradient.linear, extrasPerSpan);
	const layers: Layer[] = [
		// {
		// {
		//   kind: 'radial',
		//   options: {
		//     shape: 'circle',
		//     at: formatSpotPosition(gradient.spots[0]),
		//     stops: radialStopsAlphaFade(
		//       gradient.spots[0].color,
		//       [0, 25, 40, 60, 80],
		//       [1.0, 0.85, 0.65, 0.35, 0.0],
		//       extrasPerSpan,
		//       gradient.spots[0].softenL ?? softenL,
		//     ),
		//   },
		// },
		// {
		//   kind: 'radial',
		//   options: {
		//     shape: 'circle',
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
		{
			kind: 'linear',
			options: {
				to: linearDirection,
				stops: linearStops,
			},
		},
	];

	const gradientStack = stackBackground(layers);
	const linearFallback = buildLinear({
		to: linearFallbackDirection,
		stops: linearStops,
	});

	return {
		backgroundImage: gradientStack.fallback,
		backgroundBlendMode: 'overlay, screen, normal',
		'@supports': {
			'(color: oklch(50% 0 0))': {
				backgroundImage: gradientStack.modern,
			},
			'not (background-blend-mode: overlay)': {
				backgroundImage: linearFallback.fallback,
				backgroundBlendMode: 'normal',
			},
		},
	};
}
