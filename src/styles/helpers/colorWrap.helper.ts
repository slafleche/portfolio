/**
 * Wrapper helpers for chroma.js colors with OKLCH conversion
 * utilities.
 *
 * Chroma Color instances are mutable: calling mutator methods such as
 * `.alpha`, `.darken`, `.saturate`, etc. modifies the same object in
 * place. When a single color value (e.g. `colorVars.contrast`) is
 * shared across the codebase, those in-place mutations lead to
 * surprising side effects—for example, another part of the app
 * suddenly receives a transparent version of the "contrast" color.
 *
 * This module provides an immutable façade (`ColorWrapper`) that
 * clones the underlying color before applying any modification, so
 * every chained modifier works on an isolated copy. The original
 * chroma color remains unchanged until a caller explicitly invokes
 * `.css()` or `.value()`.
 *
 * We also piggyback on Culori to convert to/from OKLCH without giving
 * up the familiar chroma manipulation APIs. The `color` helper
 * exposes `toOKLCH`/`fromOKLCH` so gradients and other utilities can
 * opt into modern color spaces when needed while keeping sRGB
 * fallbacks.
 */
import chroma, { type Color } from 'chroma-js';
import { converter, parse, type Oklch } from 'culori';
import { notProd } from '../../lib/runtimeEnv';
export type { Color } from 'chroma-js';

type MixArgs = Parameters<Color['mix']>;

type CssOptions = {
  forceAlpha?: boolean;
  preferKeywordTransparent?: boolean;
};

export type ColorWrapper = {
  unsafeColor: Color;
  css: (options?: CssOptions) => string;
  alpha: {
    (): number;
    (value: number): ColorWrapper;
  };
  darken: (value?: number) => ColorWrapper;
  brighten: (value?: number) => ColorWrapper;
  saturate: (value?: number) => ColorWrapper;
  desaturate: (value?: number) => ColorWrapper;
  mix: (
    target: ColorInput,
    ratio?: number,
    mode?: MixArgs[2],
  ) => ColorWrapper;
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
  typeof value === 'object' &&
  value !== null &&
  'unsafeColor' in value;

const toColor = (input: ColorInput): Color => {
  if (typeof input === 'string') {
    try {
      return chroma(input);
    } catch (raw) {
      const reason =
        raw instanceof Error && raw.message
          ? raw.message
          : String(raw);
      throw new Error(
        [
          `Failed to parse color string "${input}".`,
          'Supported formats include hex ("#ff00ff"), rgb("rgb(255, 0, 0)"), hsl,',
          'oklch, or any value accepted by chroma-js.',
          `Original error: ${reason}`,
        ].join(' '),
      );
    }
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

const colorToCuloriOklch = (
  input: ColorInput,
): CuloriOKLCH | undefined => {
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
  if (!converted || converted.mode !== 'rgb') {
    throw new Error('Unable to convert OKLCH color to sRGB');
  }
  const toChannel = (channel: number) =>
    Math.max(0, Math.min(255, channel * 255));
  const base = chroma
    .rgb(
      toChannel(converted.r),
      toChannel(converted.g),
      toChannel(converted.b),
    )
    .alpha(converted.alpha ?? 1);
  return wrap(base);
};

const culoriOklchFromCss = (value: string): ColorWrapper => {
  const trimmed = value.trim();
  const normalized = trimmed.startsWith('oklch')
    ? trimmed
    : `oklch(${trimmed})`;
  const parsed = parse(normalized);
  if (!parsed || parsed.mode !== 'oklch') {
    throw new Error(
      `Expected OKLCH color string, received "${value}"`,
    );
  }
  return culoriOklchToWrapper(parsed);
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const normalizeFraction = (value: number) =>
  clamp01(value > 1 ? value / 100 : value);
const normalizeHue = (value: number) => ((value % 360) + 360) % 360;
const normalizePercent = (value: number) => {
  const percent = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, percent));
};
const normalizeRgbChannel = (value: number) => {
  const absolute = value <= 1 ? value * 255 : value;
  return Math.max(0, Math.min(255, Math.round(absolute)));
};
const normalizeAlpha = (value?: number) =>
  value === undefined ? undefined : normalizeFraction(value);

const formatHex = (value: string) => {
  const trimmed = value.trim();
  const bare = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  return `#${bare}`;
};

type OklchCreator = {
  (value: string): ColorWrapper;
  (l: number, c: number, h: number, alpha?: number): ColorWrapper;
};

type ColorCreators = {
  css: (value: string) => ColorWrapper;
  hex: (value: string) => ColorWrapper;
  rgba: (
    r: number,
    g: number,
    b: number,
    alpha?: number,
  ) => ColorWrapper;
  hsl: (
    h: number,
    s: number,
    l: number,
    alpha?: number,
  ) => ColorWrapper;
  oklch: OklchCreator;
};

const create: ColorCreators = {
  css: (value) => wrap(value),
  hex: (value) => wrap(formatHex(value)),
  rgba: (r, g, b, alpha) => {
    const R = normalizeRgbChannel(r);
    const G = normalizeRgbChannel(g);
    const B = normalizeRgbChannel(b);
    const A = normalizeAlpha(alpha);
    if (A === undefined) {
      return wrap(`rgb(${R}, ${G}, ${B})`);
    }
    return wrap(`rgba(${R}, ${G}, ${B}, ${Number(A.toFixed(3))})`);
  },
  hsl: (h, s, l, alpha) => {
    const H = normalizeHue(h);
    const S = normalizePercent(s);
    const L = normalizePercent(l);
    const A = normalizeAlpha(alpha);
    if (A === undefined) {
      return wrap(`hsl(${H}, ${S}%, ${L}%)`);
    }
    return wrap(`hsla(${H}, ${S}%, ${L}%, ${Number(A.toFixed(3))})`);
  },
  oklch: ((
    first: number | string,
    c?: number,
    h?: number,
    alpha?: number,
  ) => {
    if (typeof first === 'string') {
      return culoriOklchFromCss(first);
    }
    if (c === undefined || h === undefined) {
      throw new Error(
        'color.create.oklch requires l, c, and h values when not using a CSS string',
      );
    }
    const normalized: CuloriOKLCH = {
      mode: 'oklch',
      l: normalizeFraction(first),
      c,
      h,
      alpha: normalizeAlpha(alpha) ?? 1,
    };
    return culoriOklchToWrapper(normalized);
  }) as OklchCreator,
};

const toRgbChannel = (channel: number) =>
  Math.round(Math.max(0, Math.min(255, channel)));

const formatRgba = (value: Color): string => {
  const [
    r,
    g,
    b,
  ] = value.rgb(false);
  const alpha = value.alpha();
  const formattedAlpha =
    alpha === 1 ? '1' : Number(alpha.toFixed(3)).toString();
  return `rgba(${toRgbChannel(r)}, ${toRgbChannel(g)}, ${toRgbChannel(
    b,
  )}, ${formattedAlpha})`;
};

export function wrap(input: ColorInput): ColorWrapper {
  // ---- special symbolic case ----
  if (input === 'currentColor') {
    // dummy immutable wrapper
    const err = (fn: string) => {
      const msg = `Cannot modify symbolic color 'currentColor' via ${fn}().`;
      if (notProd()) throw new Error(msg);
      console.warn(msg);
      return symbolic;
    };

    const symbolic: ColorWrapper = {
      unsafeColor: chroma('black'),
      css: () => 'currentColor',
      alpha: ((value?: number) => {
        if (value === undefined) return 1;
        return err('alpha');
      }) as ColorWrapper['alpha'],
      darken: () => err('darken'),
      brighten: () => err('brighten'),
      saturate: () => err('saturate'),
      desaturate: () => err('desaturate'),
      mix: () => err('mix'),
      mixSolid: () => err('mixSolid'),
      clone: () => symbolic,
      value: () => chroma('black'),
      solid: () => symbolic,
    };
    return symbolic;
  }

  // ---- regular flow ----
  const base = toColor(input);
  const alpha = ((value?: number) => {
    if (value === undefined) {
      return base.alpha();
    }
    return derive(base, (draft) => draft.alpha(value));
  }) as ColorWrapper['alpha'];

  return {
    unsafeColor: base,
    css: (options?: CssOptions) => {
      const result = options?.forceAlpha
        ? formatRgba(base)
        : base.css();
      if (options?.preferKeywordTransparent && base.alpha() === 0)
        return 'transparent';
      return result;
    },
    alpha,
    darken: (value?: number) =>
      derive(base, (draft) => draft.darken(value)),
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
    mixSolid: (
      target: ColorInput,
      ratio?: number,
      mode?: MixArgs[2],
    ) =>
      derive(base, (draft) =>
        draft.alpha(1).mix(toColor(target), clampRatio(ratio), mode),
      ),
    clone: () => wrap(cloneColor(base)),
    value: () => cloneColor(base),
    solid: () => derive(base, (draft) => draft.alpha(1)),
  };
}

export const color = Object.assign(
  (input: ColorInput) => wrap(input),
  {
    wrap,
    from: wrap,
    unsafeChroma: chroma,
    unsafeToColor: toColor,
    toOKLCH: (input: ColorInput) => colorToCuloriOklch(input),
    fromOKLCH: (value: CuloriOKLCH) => culoriOklchToWrapper(value),
    oklch: (value: CuloriOKLCH) => culoriOklchToWrapper(value),
    create,
    scale: (stops: ColorInput[]): ChromaScale => createScale(stops),
    lch: (l: number, c: number, h: number) =>
      wrap(chroma.lch(l, c, h)),
    fromCss: (value: string) => wrap(value),
  },
);

export const mixWithAlpha = (
  base: ColorWrapper,
  target: ColorInput,
  ratio: number,
  alpha?: number,
): ColorWrapper => {
  const desiredAlpha = alpha ?? base.alpha();
  return base.mixSolid(target, ratio).alpha(desiredAlpha);
};
