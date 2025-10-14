import { color, type ColorWrapper } from "./colorWrap";
import {
  buildLinear,
  stackBackground,
  type Layer,
  type Stop,
} from "./gradients";

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
): Stop[] {
  const [L, C, H] = base.value().lch();
  const make = (alpha: number) => color.lch(L + softenL, C, H).alpha(alpha);

  const anchors = anchorPercents.map((p, i) => ({
    p,
    alpha: anchorAlphas[i],
    color: make(anchorAlphas[i]),
  }));
  const out: Stop[] = [];

  for (let i = 0; i < anchors.length - 1; i++) {
    const A = anchors[i];
    const B = anchors[i + 1];
    out.push({ color: A.color, at: A.p });

    const mids = interiorPercents(A.p, B.p, extrasPerSpan);
    for (let j = 0; j < mids.length; j++) {
      const t = (j + 1) / (extrasPerSpan + 1);
      const alpha = A.alpha + t * (B.alpha - A.alpha);
      out.push({ color: make(alpha), at: mids[j] });
    }
  }

  const last = anchors.at(-1)!;
  out.push({ color: last.color, at: last.p });
  return out;
}

function linearStopsLab(
  top: ColorWrapper,
  mid: ColorWrapper,
  bottom: ColorWrapper,
  extrasPerSpan = 1,
): Stop[] {
  const spans = [
    { a: { color: top, at: 20 }, b: { color: mid, at: 55 } },
    { a: { color: mid, at: 55 }, b: { color: bottom, at: 90 } },
  ];

  const out: Stop[] = [];
  for (const { a, b } of spans) {
    out.push({ color: a.color, at: a.at });
    const mids = interiorPercents(a.at, b.at, extrasPerSpan);
    const scale = color.scale([a.color, b.color]).mode("lab");
    for (let i = 0; i < mids.length; i++) {
      const t = (i + 1) / (extrasPerSpan + 1);
      out.push({ color: color.wrap(scale(t)), at: mids[i] });
    }
  }

  out.push({ color: bottom, at: 90 });
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
  const linearStops = linearStopsLab(top, mid, bottom, extrasPerSpan);

  const layers: Layer[] = [
    {
      kind: "radial",
      options: {
        shape: "circle",
        at: "100% 49%",
        stops: r1Stops,
      },
    },
    {
      kind: "radial",
      options: {
        shape: "circle",
        at: "97% 98%",
        stops: r2Stops,
      },
    },
    {
      kind: "linear",
      options: {
        to: "to bottom",
        stops: linearStops,
      },
    },
  ];

  const gradient = stackBackground(layers);
  const linearOnly = buildLinear({ to: "to bottom", stops: linearStops });

  return {
    backgroundImage: gradient.fallback,
    backgroundBlendMode: "overlay, screen, normal",
    "@supports": {
      "(color: oklch(50% 0 0))": {
        backgroundImage: gradient.modern,
      },
      "not (background-blend-mode: overlay)": {
        backgroundImage: linearOnly.fallback,
        backgroundBlendMode: "normal",
      },
    },
  };
}
