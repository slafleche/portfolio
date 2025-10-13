import { color, type ColorWrapper } from '@/styles/helpers/colorWrap';

type Spec = {
	spotA: ColorWrapper;
	spotB: ColorWrapper;
	linearColors: [ColorWrapper, ColorWrapper, ColorWrapper];
	extrasPerSpan?: number;
	softenL?: number;
};

const pctLerp = (a: number, b: number, t: number) => a + (b - a) * t;
const interiorPercents = (p1: number, p2: number, n: number) =>
	Array.from({ length: n }, (_, i) => pctLerp(p1, p2, (i + 1) / (n + 1)));

function radialStopsAlphaFade(
	base: ColorWrapper,
	anchorPercents: number[],
	anchorAlphas: number[],
	extrasPerSpan = 1,
	softenL = 0,
): string[] {
	const [L, C, H] = base.value().lch();
	const make = (a: number) =>
		color
			.lch(L + softenL, C, H)
			.alpha(a)
			.css();

	const anchors = anchorPercents.map((p, i) => ({
		p,
		c: make(anchorAlphas[i]),
	}));
	const out: string[] = [];

	for (let i = 0; i < anchors.length - 1; i++) {
		const A = anchors[i],
			B = anchors[i + 1];
		out.push(`${A.c} ${A.p}%`);
		const mids = interiorPercents(A.p, B.p, extrasPerSpan);
		const aA = color(A.c).value().alpha();
		const aB = color(B.c).value().alpha();
		for (let j = 0; j < mids.length; j++) {
			const t = (j + 1) / (extrasPerSpan + 1);
			const a = aA + t * (aB - aA);
			out.push(`${make(a)} ${mids[j]}%`);
		}
	}
	const last = anchors.at(-1)!;
	out.push(`${last.c} ${last.p}%`);
	return out;
}

function linearStopsLab(
	top: ColorWrapper,
	mid: ColorWrapper,
	bottom: ColorWrapper,
	extrasPerSpan = 1,
): string[] {
	const spans = [
		{ a: { c: top, p: 20 }, b: { c: mid, p: 55 } },
		{ a: { c: mid, p: 55 }, b: { c: bottom, p: 90 } },
	];

	const out: string[] = [];
	for (const { a, b } of spans) {
		out.push(`${a.c.css()} ${a.p}%`);
		const mids = interiorPercents(a.p, b.p, extrasPerSpan);
		const scale = color.scale([a.c.value(), b.c.value()]).mode('lab');
		for (let i = 0; i < mids.length; i++) {
			const t = (i + 1) / (extrasPerSpan + 1);
			out.push(`${scale(t).css()} ${mids[i]}%`);
		}
	}
	out.push(`${bottom.css()} 90%`);
	return out;
}

export function makeGradient({
	spotA,
	spotB,
	linearColors,
	extrasPerSpan = 1,
	softenL = 0,
}: Spec) {
	const r1Stops = radialStopsAlphaFade(
		spotA,
		[0, 25, 40, 60, 80],
		[1.0, 0.85, 0.65, 0.35, 0.0],
		extrasPerSpan,
		softenL,
	);

	const r2Stops = radialStopsAlphaFade(spotB, [0, 30], [0.6, 0.0], 0, 0);

	const [top, mid, bottom] = linearColors;
	const linStops = linearStopsLab(top, mid, bottom, extrasPerSpan);

	// Wrap all layers in a container with global opacity applied
	return {
		backgroundImage: `
      radial-gradient(circle at 100% 49%, ${r1Stops.join(', ')}),
      radial-gradient(circle at 97% 98%, ${r2Stops.join(', ')}),
      linear-gradient(to bottom, ${linStops.join(', ')})
    `,
		backgroundBlendMode: 'overlay, screen, normal',
		// fallback: simple linear gradient if blend-mode unsupported
		'@supports': {
			'not (background-blend-mode: overlay)': {
				backgroundImage: `linear-gradient(to bottom, ${top.css()} 20%, ${mid.css()} 55%, ${bottom.css()} 90%)`,
				backgroundBlendMode: 'normal',
			},
		},
	};
}
