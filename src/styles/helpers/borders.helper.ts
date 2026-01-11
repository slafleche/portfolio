import { hasCssMethod,isMeasurement } from 'css-calipers';

import { notRelease } from '@/lib/runtimeEnv';
import type {
  AxisValues,
  CompassCorners,
  CompassRegion,
  CompassRegionAlias,
  CornerPosition,
  CSS_TYPES,
} from '@/styles/helpers/types.helper';

import type {
  BorderMeasurementInput,
  BorderRadiusInput,
  BorderWidthInput,
  IBorder,
} from '../../tokens/global.tokens';
import { borderVars, colorVars } from '../../tokens/global.tokens';
import { isColorWrapper } from './colorWrap.helper';

/**
 * Public UX: Border({ bottom: true, bottom: { width: m(6) }, radius:
 * { south: m(8) } }) Helpers:
 * borders.none/top/right/bottom/left/vertical/horizontal/all
 */

type BorderLike = IBorder | Readonly<IBorder>;

type EdgeSpec = boolean | BorderLike;
type RadiusSpec = CompassCorners<BorderRadiusInput>;

const isRadiusCompass = (
  value: BorderIntent['radius'],
): value is RadiusSpec =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

export interface BorderIntent extends AxisValues<EdgeSpec> {
  radius?: RadiusSpec | 0 | null; // 0/null → explicit no radius
}

interface FinalBorderCSS {
  borderColor?: CSS_TYPES.Property.BorderColor;
  borderStyle?: CSS_TYPES.Property.BorderStyle;
  borderWidth?: CSS_TYPES.Property.BorderWidth;
  borderRadius?: CSS_TYPES.Property.BorderRadius;
  borderTopLeftRadius?: CSS_TYPES.Property.BorderTopLeftRadius;
  borderTopRightRadius?: CSS_TYPES.Property.BorderTopRightRadius;
  borderBottomRightRadius?: CSS_TYPES.Property.BorderBottomRightRadius;
  borderBottomLeftRadius?: CSS_TYPES.Property.BorderBottomLeftRadius;

  borderTopColor?: CSS_TYPES.Property.BorderTopColor;
  borderRightColor?: CSS_TYPES.Property.BorderRightColor;
  borderBottomColor?: CSS_TYPES.Property.BorderBottomColor;
  borderLeftColor?: CSS_TYPES.Property.BorderLeftColor;

  borderTopStyle?: CSS_TYPES.Property.BorderTopStyle;
  borderRightStyle?: CSS_TYPES.Property.BorderRightStyle;
  borderBottomStyle?: CSS_TYPES.Property.BorderBottomStyle;
  borderLeftStyle?: CSS_TYPES.Property.BorderLeftStyle;

  borderTopWidth?: CSS_TYPES.Property.BorderTopWidth;
  borderRightWidth?: CSS_TYPES.Property.BorderRightWidth;
  borderBottomWidth?: CSS_TYPES.Property.BorderBottomWidth;
  borderLeftWidth?: CSS_TYPES.Property.BorderLeftWidth;

  border?: 'none';
}

type BorderOptions = {
  skipDefaults?: boolean;
};

/* --------------------------
   Utilities
-------------------------- */

// IMeasurement → .css()
const toCssLen = (v: BorderMeasurementInput): string | undefined => {
  if (v == null) return undefined;
  return v.css();
};

const fallbackWidth = (): string => toCssLen(borderVars.width) ?? '0';
const fallbackRadius = (): string =>
  toCssLen(borderVars.radius) ?? '0';
const fallbackStyle = (): CSS_TYPES.Property.BorderStyle =>
  (borderVars.style as CSS_TYPES.Property.BorderStyle) ?? 'solid';
const fallbackColor = (): string =>
  colorVars.border.css() ?? 'transparent';

const asWidth = (
  v: BorderWidthInput | undefined,
): string | undefined => {
  if (v == null) return undefined;
  if (isMeasurement(v)) return v.css();
  return undefined;
};

const asRadius = (
  v: BorderRadiusInput | undefined,
): string | undefined => {
  if (v == null) return undefined;
  if (Array.isArray(v)) {
    const entries = v.filter(isMeasurement);
    if (entries.length === 0) return undefined;
    return entries.map((entry) => entry.css()).join(' ');
  }
  if (isMeasurement(v)) return v.css();
  return undefined;
};

/* --------------------------
   Intent resolution
-------------------------- */

type EdgeState = {
  active: boolean;
  width?: string;
  style?: CSS_TYPES.Property.BorderStyle;
  color?: string;
  _wExp?: boolean;
  _sExp?: boolean;
  _cExp?: boolean;
};

const emptyEdge = (): EdgeState => ({ active: false });

const applyEdgeSpec = (
  edge: EdgeState,
  spec?: EdgeSpec,
): EdgeState => {
  if (spec === undefined || spec === false) return edge;
  if (spec === true) {
    edge.active = true;
    return edge;
  }

  // Narrow to object before property access
  if (typeof spec !== 'object' || spec === null) return edge;

  edge.active = true;

  if ('width' in spec && spec.width !== undefined) {
    edge.width =
      asWidth((spec as { width?: BorderWidthInput }).width) ??
      fallbackWidth();
    edge._wExp = true;
  }

  if ('style' in spec && spec.style !== undefined) {
    edge.style = (
      spec as { style?: CSS_TYPES.Property.BorderStyle }
    ).style!;
    edge._sExp = true;
  }

  if (
    'color' in spec &&
    (spec as { color?: unknown }).color !== undefined
  ) {
    const c = (spec as { color?: unknown }).color;
    edge.color =
      typeof c === 'string'
        ? c // 'transparent' / 'currentColor' etc.
        : isColorWrapper(c)
          ? c.alpha() < 1
            ? c.css({ forceAlpha: true })
            : c.css()
          : hasCssMethod(c)
            ? c.css()
            : fallbackColor(); // dev-only: you can throw here if you prefer
    edge._cExp = true;
  }

  return edge;
};

const resolveIntentToEdges = (
  intent: BorderIntent | undefined,
  options?: BorderOptions,
) => {
  const t = emptyEdge(),
    r = emptyEdge(),
    b = emptyEdge(),
    l = emptyEdge();

  if (intent?.all !== undefined)
    [
      t,
      r,
      b,
      l,
    ].forEach((e) => applyEdgeSpec(e, intent.all));

  if (intent?.vertical !== undefined) {
    applyEdgeSpec(t, intent.vertical);
    applyEdgeSpec(b, intent.vertical);
  }
  if (intent?.horizontal !== undefined) {
    applyEdgeSpec(l, intent.horizontal);
    applyEdgeSpec(r, intent.horizontal);
  }

  if (intent?.top !== undefined) applyEdgeSpec(t, intent.top);
  if (intent?.right !== undefined) applyEdgeSpec(r, intent.right);
  if (intent?.bottom !== undefined) applyEdgeSpec(b, intent.bottom);
  if (intent?.left !== undefined) applyEdgeSpec(l, intent.left);

  const dW = fallbackWidth();
  const dS = fallbackStyle();
  const dC = fallbackColor();
  const applyDefaults = options?.skipDefaults !== true;
  const edges = [
    t,
    r,
    b,
    l,
  ];
  edges.forEach((e) => {
    if (e.active) {
      if (!e.width && applyDefaults) e.width = dW;
      if (!e.style && applyDefaults) e.style = dS;
      if (!e.color && applyDefaults) e.color = dC;
    } else {
      if (applyDefaults) e.width = '0';
    }
  });

  return { t, r, b, l };
};

/* --------------------------
   Radius resolution (compass)
-------------------------- */

type Corner = 'tl' | 'tr' | 'br' | 'bl';

const cornersForZone: Record<CompassRegion, Corner[]> = {
  north: [
    'tl',
    'tr',
  ],
  south: [
    'bl',
    'br',
  ],
  east: [
    'tr',
    'br',
  ],
  west: [
    'tl',
    'bl',
  ],
};

const cornerLookup: Record<CornerPosition, Corner> = {
  nw: 'tl',
  ne: 'tr',
  se: 'br',
  sw: 'bl',
};

const zoneKeys: CompassRegion[] = [
  'north',
  'south',
  'east',
  'west',
];

const regionAliasLookup: Record<CompassRegion, CompassRegionAlias> =
  {
    north: 'n',
    south: 's',
    east: 'e',
    west: 'w',
  };

type ResolvedRadius = {
  tl: string;
  tr: string;
  br: string;
  bl: string;
};

const resolveRadiusCompass = (
  radius: BorderIntent['radius'],
  edges: ReturnType<typeof resolveIntentToEdges>,
): ResolvedRadius | undefined => {
  if (radius === 0 || radius === null) return undefined;
  const rc = isRadiusCompass(radius) ? radius : undefined;

  const cornerVals: Partial<Record<Corner, string>> = {};
  const putIf = (c: Corner, v?: BorderRadiusInput) => {
    const val = asRadius(v);
    if (val) cornerVals[c] = val;
  };

  const readZoneValue = (
    zone: CompassRegion,
  ): BorderRadiusInput | undefined => {
    if (!rc) return undefined;
    const direct = rc[zone];
    if (direct !== undefined) return direct;
    return rc[regionAliasLookup[zone]];
  };

  const allR = asRadius(rc?.all);
  if (allR)
    cornerVals.tl =
      cornerVals.tr =
      cornerVals.br =
      cornerVals.bl =
        allR;

  zoneKeys.forEach((zone) => {
    const zVal = asRadius(readZoneValue(zone));
    if (zVal)
      cornersForZone[zone].forEach((c) => (cornerVals[c] = zVal));
  });

  (
    Object.entries(cornerLookup) as [CornerPosition, Corner][]
  ).forEach(
    ([
      pos,
      corner,
    ]) => putIf(corner, rc?.[pos]),
  );

  if (Object.keys(cornerVals).length === 0) return undefined;

  const explicitCorners = new Set<Corner>();
  (
    Object.entries(cornerLookup) as [CornerPosition, Corner][]
  ).forEach(
    ([
      pos,
      corner,
    ]) => {
      if (rc?.[pos] !== undefined) explicitCorners.add(corner);
    },
  );

  const { t, r, b, l } = edges;
  const cornerHasAdjacent = (c: Corner) => {
    switch (c) {
      case 'tl':
        return t.active || l.active;
      case 'tr':
        return t.active || r.active;
      case 'br':
        return b.active || r.active;
      case 'bl':
        return b.active || l.active;
    }
  };

  const tl =
    explicitCorners.has('tl') || cornerHasAdjacent('tl')
      ? (cornerVals.tl ?? fallbackRadius())
      : undefined;
  const tr =
    explicitCorners.has('tr') || cornerHasAdjacent('tr')
      ? (cornerVals.tr ?? fallbackRadius())
      : undefined;
  const br =
    explicitCorners.has('br') || cornerHasAdjacent('br')
      ? (cornerVals.br ?? fallbackRadius())
      : undefined;
  const bl =
    explicitCorners.has('bl') || cornerHasAdjacent('bl')
      ? (cornerVals.bl ?? fallbackRadius())
      : undefined;

  if (!tl && !tr && !br && !bl) return undefined;

  const ftl = tl ?? '0';
  const ftr = tr ?? '0';
  const fbr = br ?? '0';
  const fbl = bl ?? '0';

  const allZero = [ftl, ftr, fbr, fbl].every(
    (value) => value === '0' || value === '0px',
  );
  if (allZero) return undefined;

  return {
    tl: ftl,
    tr: ftr,
    br: fbr,
    bl: fbl,
  };
};

/* --------------------------
   Main: border()
-------------------------- */

const hasRadiusIntent = (intent?: BorderIntent): boolean => {
  if (!intent) return false;
  const radius = intent.radius;
  if (radius === undefined || radius === null || radius === 0)
    return false;
  if (typeof radius === 'object') {
    return Object.keys(radius).length > 0;
  }
  return true;
};

const edgeKeys: Array<Exclude<keyof BorderIntent, 'radius'>> = [
  'all',
  'vertical',
  'horizontal',
  'top',
  'right',
  'bottom',
  'left',
];

const hasEdgeIntent = (intent?: BorderIntent): boolean => {
  if (!intent) return false;
  return edgeKeys.some((key) => {
    const value = intent[key];
    return value !== undefined && value !== false;
  });
};

// Here's the main resolver function
type BorderShortcut = Partial<BorderLike> & {
  radius?:
    | BorderRadiusInput
    | Partial<
        Record<
          'all' | CompassRegion | CompassRegionAlias | CornerPosition,
          BorderRadiusInput
        >
      >;
};

type BorderInput =
  | BorderIntent
  | BorderRadiusInput
  | BorderShortcut
  | BorderLike;

const normalizeIntent = (
  input?: BorderInput,
): BorderIntent | undefined => {
  if (input === undefined || input === null) return undefined;
  if (typeof input !== 'object') {
    if (notRelease()) {
      throw new Error(
        '[borders] Shorthand inputs must identify their intent (e.g., `{ radius: { all: measurement } }`).',
      );
    }
    return undefined;
  }

  const { width, color, style, radius, ...rest } =
    input as BorderShortcut & BorderIntent;

  const intent = rest as BorderIntent;

  if (
    width !== undefined ||
    color !== undefined ||
    style !== undefined
  ) {
    const shorthandAll: IBorder = {};
    if (width !== undefined) shorthandAll.width = width;
    if (color !== undefined) shorthandAll.color = color;
    if (style !== undefined) shorthandAll.style = style;

    const existingAll =
      intent.all &&
      intent.all !== true &&
      typeof intent.all === 'object'
        ? intent.all
        : undefined;

    intent.all = {
      ...shorthandAll,
      ...(existingAll ?? {}),
    };
  }

  if (radius !== undefined) {
    if (Array.isArray(radius)) {
      intent.radius = {
        all: radius,
      };
    } else if (isMeasurement(radius)) {
      intent.radius = {
        all: radius,
      };
    } else if (isRadiusCompass(radius)) {
      intent.radius = radius;
    } else {
      intent.radius = radius as BorderIntent['radius'];
    }
  }

  return intent;
};

const resolve = (
  input?: BorderInput,
  options?: BorderOptions,
): FinalBorderCSS => {
  const intent = normalizeIntent(input);
  if (intent && 'all' in intent && intent.all === false) {
    // prefer borders.none()
  }

  const { t, r, b, l } = resolveIntentToEdges(intent ?? {}, options);
  const anyActive = t.active || r.active || b.active || l.active;

  if (!anyActive) return {};

  const widths = [
    t.width,
    r.width,
    b.width,
    l.width,
  ];
  const css: FinalBorderCSS = {};

  const [
    tw,
    rw,
    bw,
    lw,
  ] = widths;
  const widthsDefined = widths.every((w) => w !== undefined);
  if (widthsDefined) {
    css.borderTopWidth =
      tw as CSS_TYPES.Property.BorderTopWidth;
    css.borderRightWidth =
      rw as CSS_TYPES.Property.BorderRightWidth;
    css.borderBottomWidth =
      bw as CSS_TYPES.Property.BorderBottomWidth;
    css.borderLeftWidth =
      lw as CSS_TYPES.Property.BorderLeftWidth;
  } else {
    if (tw !== undefined) {
      css.borderTopWidth =
        tw as CSS_TYPES.Property.BorderTopWidth;
    }
    if (rw !== undefined) {
      css.borderRightWidth =
        rw as CSS_TYPES.Property.BorderRightWidth;
    }
    if (bw !== undefined) {
      css.borderBottomWidth =
        bw as CSS_TYPES.Property.BorderBottomWidth;
    }
    if (lw !== undefined) {
      css.borderLeftWidth =
        lw as CSS_TYPES.Property.BorderLeftWidth;
    }
  }

  if (t.style !== undefined) {
    css.borderTopStyle =
      t.style as CSS_TYPES.Property.BorderTopStyle;
  }
  if (r.style !== undefined) {
    css.borderRightStyle =
      r.style as CSS_TYPES.Property.BorderRightStyle;
  }
  if (b.style !== undefined) {
    css.borderBottomStyle =
      b.style as CSS_TYPES.Property.BorderBottomStyle;
  }
  if (l.style !== undefined) {
    css.borderLeftStyle =
      l.style as CSS_TYPES.Property.BorderLeftStyle;
  }

  if (t.color !== undefined) {
    css.borderTopColor = t.color;
  }
  if (r.color !== undefined) {
    css.borderRightColor = r.color;
  }
  if (b.color !== undefined) {
    css.borderBottomColor = b.color;
  }
  if (l.color !== undefined) {
    css.borderLeftColor = l.color;
  }

  const radiusCorners = resolveRadiusCompass(intent?.radius, {
    t,
    r,
    b,
    l,
  });
  if (radiusCorners) {
    css.borderTopLeftRadius = radiusCorners.tl;
    css.borderTopRightRadius = radiusCorners.tr;
    css.borderBottomRightRadius = radiusCorners.br;
    css.borderBottomLeftRadius = radiusCorners.bl;
  }

  return css;
};

const resolveRadiusOnly = (input?: BorderInput): FinalBorderCSS => {
  const isMeasurementList = (
    value: unknown,
  ): value is ReadonlyArray<BorderMeasurementInput> =>
    Array.isArray(value) && value.every(isMeasurement);

  const radiusShorthandKeys = new Set([
    'topLeft',
    'topRight',
    'bottomRight',
    'bottomLeft',
    'north',
    'south',
    'east',
    'west',
    'n',
    's',
    'e',
    'w',
    'nw',
    'ne',
    'se',
    'sw',
  ]);

  const hasRadiusShorthand = (value: unknown): boolean => {
    if (!value || typeof value !== 'object') return false;
    if (Array.isArray(value) || isMeasurement(value)) return false;
    return Object.entries(value).some(
      ([key, entry]) =>
        radiusShorthandKeys.has(key) &&
        (isMeasurement(entry) || isMeasurementList(entry)),
    );
  };

  const intent = normalizeIntent(
    isMeasurement(input) ||
      isMeasurementList(input) ||
      hasRadiusShorthand(input)
      ? { radius: input as BorderRadiusInput }
      : input,
  );
  if (!intent) return {};
  if (!hasRadiusIntent(intent) || hasEdgeIntent(intent)) return {};

  const radius = intent.radius;

  // Fast-path radius-only shorthand where the intent is "all corners get the
  // same radius" and no edge intent is present. This avoids relying on edge
  // adjacency and keeps the mental model aligned with radius: m(...) or
  // radius: { all: m(...) } meaning "uniform rounded corners".
  if (radius && typeof radius === 'object') {
    const keys = Object.keys(radius);
    if (
      Object.prototype.hasOwnProperty.call(radius, 'all') &&
      keys.length === 1
    ) {
      const allVal = asRadius(
        (radius as Record<'all', BorderRadiusInput>).all,
      );
      if (!allVal || allVal === '0' || allVal === '0px') {
        return {};
      }
      return {
        borderTopLeftRadius: allVal,
        borderTopRightRadius: allVal,
        borderBottomRightRadius: allVal,
        borderBottomLeftRadius: allVal,
      };
    }
  }

  const edges = resolveIntentToEdges(intent);
  const radiusCorners = resolveRadiusCompass(intent.radius, edges);

  if (!radiusCorners) return {};

  return {
    borderTopLeftRadius: radiusCorners.tl,
    borderTopRightRadius: radiusCorners.tr,
    borderBottomRightRadius: radiusCorners.br,
    borderBottomLeftRadius: radiusCorners.bl,
  };
};

/* --------------------------
   Public API
-------------------------- */

export const borders = Object.assign(
  (intent?: BorderInput, options?: BorderOptions): FinalBorderCSS =>
    resolve(intent, options),
  {
    none(): FinalBorderCSS {
      return { border: 'none' };
    },
    top(overrides?: BorderLike, options?: BorderOptions): FinalBorderCSS {
      return resolve({ top: overrides ?? true }, options);
    },
    right(overrides?: BorderLike, options?: BorderOptions): FinalBorderCSS {
      return resolve({ right: overrides ?? true }, options);
    },
    bottom(overrides?: BorderLike, options?: BorderOptions): FinalBorderCSS {
      return resolve({ bottom: overrides ?? true }, options);
    },
    left(overrides?: BorderLike, options?: BorderOptions): FinalBorderCSS {
      return resolve({ left: overrides ?? true }, options);
    },
    vertical(overrides?: BorderLike, options?: BorderOptions): FinalBorderCSS {
      return resolve({ vertical: overrides ?? true }, options);
    },
    horizontal(
      overrides?: BorderLike,
      options?: BorderOptions,
    ): FinalBorderCSS {
      return resolve({ horizontal: overrides ?? true }, options);
    },
    all(overrides?: BorderLike, options?: BorderOptions): FinalBorderCSS {
      return resolve({ all: overrides ?? true }, options);
    },
    defaults(options?: BorderOptions): FinalBorderCSS {
      return resolve({ all: true }, options);
    },
    radii(intent?: BorderInput): FinalBorderCSS {
      return resolveRadiusOnly(intent);
    },
    unset(): FinalBorderCSS {
      return { border: 'none' };
    },
  },
);

export default borders;
