import { color, type ColorWrapper, type CuloriOKLCH } from "./colorWrap";

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
    const scale = color.scale([a.color, b.color]).mode('lab');
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
      kind: 'radial',
      options: {
        shape: 'circle',
        at: '100% 49%',
        stops: r1Stops,
      },
    },
    {
      kind: 'radial',
      options: {
        shape: 'circle',
        at: '97% 98%',
        stops: r2Stops,
      },
    },
    {
      kind: 'linear',
      options: {
        to: 'to bottom',
        stops: linearStops,
      },
    },
  ];

  const gradient = stackBackground(layers);
  const linearOnly = buildLinear({ to: 'to bottom', stops: linearStops });

  return {
    backgroundImage: gradient.fallback,
    backgroundBlendMode: 'overlay, screen, normal',
    '@supports': {
      '(color: oklch(50% 0 0))': {
        backgroundImage: gradient.modern,
      },
      'not (background-blend-mode: overlay)': {
        backgroundImage: linearOnly.fallback,
        backgroundBlendMode: 'normal',
      },
    },
  };
}

/** OKLCH tuple (percents for L, chroma as 0..~0.4, hue in degrees) */
export type OKLCH = { l: number; c: number; h: number; a?: number };
export type ColorInput = OKLCH | string | ColorWrapper; // supports wrapped theme colors

export type Stop = {
  color: ColorInput;
  /** Position as %, 0..100 (number OR string "40%" accepted) */
  at: number | string;
};

export type LinearOpts = {
  to?: string; // e.g. "to bottom right" | "45deg"; default: "to bottom"
  stops: Stop[];
};

export type RadialOpts = {
  /** ellipse or circle sizes (CSS values). Example: "120px 140px" or "closest-side" */
  size?: string;          // default: "farthest-corner"
  at?: string;            // e.g. "20% 30%"; default: "50% 50%"
  shape?: "circle" | "ellipse"; // default: "ellipse"
  stops: Stop[];
};

export type Layer =
  | { kind: "linear"; options: LinearOpts }
  | { kind: "radial"; options: RadialOpts };

export type Built = { fallback: string; modern: string };

const pct = (p: number | string) => (typeof p === "number" ? `${p}%` : p);

function isColorWrapper(value: unknown): value is ColorWrapper {
  return (
    typeof value === "object" &&
    value !== null &&
    "unsafeColor" in (value as Record<string, unknown>)
  );
}

/** Format OKLCH -> CSS oklch() */
function fmtOKLCH({ l, c, h, a }: OKLCH): string {
  const L = `${clamp(l, 0, 100).toFixed(3)}%`;
  const C = clamp(c, 0, 0.4).toFixed(4); // practical range
  const H = ((h % 360) + 360) % 360;
  const A = a == null ? "" : ` / ${clamp(a, 0, 1)}`;
  return `oklch(${L} ${C} ${H}${A})`;
}

/** Approximate OKLCH -> sRGB using LCH as a stand-in (close enough for UI gradients). */
function oklchToRgbString({ l, c, h, a }: OKLCH): string {
  const normalized: CuloriOKLCH = {
    mode: "oklch",
    l: clamp(l, 0, 100) / 100,
    c: clamp(c, 0, 0.4),
    h: ((h % 360) + 360) % 360,
    alpha: a ?? 1,
  };
  return color.fromOKLCH(normalized).css();
}

function isOKLCH(x: ColorInput): x is OKLCH {
  return typeof x === "object" && x != null && "l" in x && "c" in x && "h" in x;
}

function toModernOKLCH(input: ColorInput): OKLCH | undefined {
  if (isOKLCH(input)) return input;
  const source = isColorWrapper(input)
    ? input
    : typeof input === "string"
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

function buildLinear({ to = "to bottom", stops }: LinearOpts): Built {
  const fStops = stops.map(s => `${colorFallback(s.color)} ${pct(s.at)}`).join(", ");
  const mStops = stops.map(s => `${colorModern(s.color)} ${pct(s.at)}`).join(", ");
  return {
    fallback: `linear-gradient(${to}, ${fStops})`,
    modern: `linear-gradient(${to}, ${mStops})`,
  };
}

function buildRadial({
  size = "farthest-corner",
  at = "50% 50%",
  shape = "ellipse",
  stops,
}: RadialOpts): Built {
  const header = `${shape} ${size} at ${at}`;
  const fStops = stops.map(s => `${colorFallback(s.color)} ${pct(s.at)}`).join(", ");
  const mStops = stops.map(s => `${colorModern(s.color)} ${pct(s.at)}`).join(", ");
  return {
    fallback: `radial-gradient(${header}, ${fStops})`,
    modern: `radial-gradient(${header}, ${mStops})`,
  };
}

/** Stack multiple layers (top→bottom) into background strings */
export function stackBackground(layers: Layer[]): Built {
  const parts = layers.map(l => (l.kind === "linear" ? buildLinear(l.options) : buildRadial(l.options)));
  return {
    fallback: parts.map(p => p.fallback).join(", "),
    modern: parts.map(p => p.modern).join(", "),
  };
}

/** Optional convenience: set fallback first, then upgrade if OKLCH supported */
export function applyBackground(
  el: HTMLElement,
  layers: Layer[],
  blendModes?: string[] // e.g. ["screen","multiply","normal"]
): void {
  const built = stackBackground(layers);
  el.style.background = built.fallback;
  if (blendModes?.length) el.style.backgroundBlendMode = blendModes.join(", ");
  if (CSS.supports("color", "oklch(50% 0 0)")) {
    el.style.background = built.modern;
  }
}

/** Utility: build evenly-spaced stops from a list of colors */
export function stopsFromColors(colors: ColorInput[], alpha?: number): Stop[] {
  const n = Math.max(1, colors.length - 1);
  return colors.map((c, i) => {
    const pos = (i / n) * 100;
    if (isOKLCH(c) && alpha != null) return { color: { ...c, a: alpha }, at: pos };
    if (isColorWrapper(c) && alpha != null) return { color: c.alpha(alpha), at: pos };
    return { color: c, at: pos };
  });
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
