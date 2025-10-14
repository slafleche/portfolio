import { color, type ColorWrapper } from './colorWrap';
import {
	buildLinear,
	stackBackground,
	type Layer,
	type Stop,
} from './gradients';

type CardGradientPack = {
	linear: ColorWrapper[];
	spots: ColorWrapper[];
};

const pctLerp = (a: number, b: number, t: number) => a + (b - a) * t;
const interiorPercents = (p1: number, p2: number, n: number) =>
	Array.from({ length: n }, (_, i) =>
		pctLerp(p1, p2, (i + 1) / (n + 1)),
	);

function radialStopsAlphaFade(
	base: ColorWrapper,
	anchorPercents: number[],
	anchorAlphas: number[],
	extrasPerSpan = 1,
	softenL = 0,
): Stop[] {
	const [L, C, H] = base.value().lch();
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
	slices: ColorWrapper[],
	extrasPerSpan = 1,
): Stop[] {
	if (slices.length < 2) {
		return slices.map((color, index) => ({
			color,
			at: index === 0 ? 0 : 100,
		}));
	}

	const spanPercentages =
		slices.length === 3
			? [
					[20, 55],
					[55, 90],
				]
			: slices.slice(1).map((_, i) => {
					const start = (i / slices.length) * 100;
					const end = ((i + 1) / slices.length) * 100;
					return [start, end] as [number, number];
				});

	const out: Stop[] = [];
	for (let i = 0; i < spanPercentages.length; i++) {
		const [start, end] = spanPercentages[i];
		const aColor = slices[i];
		const bColor = slices[i + 1];
		out.push({
			color: aColor,
			at: start,
		});
		const mids = interiorPercents(start, end, extrasPerSpan);
		const scale = color.scale([aColor, bColor]).mode('lab');
		for (let j = 0; j < mids.length; j++) {
			const t = (j + 1) / (extrasPerSpan + 1);
			out.push({
				color: color.wrap(scale(t)),
				at: mids[j],
			});
		}
	}

	out.push({
		color: slices.at(-1)!,
		at: spanPercentages.at(-1)?.[1] ?? 100,
	});
	return out;
}

export function makeCardGradient(
	gradient: CardGradientPack,
	options: {
		extrasPerSpan?: number;
		softenL?: number;
		linearDirection?: string;
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
		//   kind: 'radial',
		//   options: {
		//     shape: 'circle',
		//     at: '100% 49%',
		//     stops: radialStopsAlphaFade(
		//       gradient.spots[0],
		//       [0, 25, 40, 60, 80],
		//       [1.0, 0.85, 0.65, 0.35, 0.0],
		//       extrasPerSpan,
		//       softenL,
		//     ),
		//   },
		// },
		// {
		//   kind: 'radial',
		//   options: {
		//     shape: 'circle',
		//     at: '97% 98%',
		//     stops: radialStopsAlphaFade(
		//       gradient.spots[1] ?? gradient.spots[0],
		//       [0, 30],
		//       [0.6, 0.0],
		//       0,
		//       softenL,
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
