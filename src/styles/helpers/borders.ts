import type * as CSS from 'csstype';
import { borderVars, colorVars } from '../componentTokens/global.componentTokens';
import type {
  IBorder,
  BorderWidthInput,
  BorderRadiusInput,
} from '../componentTokens/global.componentTokens';
import { isMeasurement, hasCssMethod } from './measurement';
import type {
  AxisValues,
  CompassCorners,
  CompassRegion,
  CornerPosition,
  MeasurementLike,
} from './types';

/**
 * Public UX: Border({ bottom: true, bottom: { width: m(6) }, radius:
 * { south: m(8) } }) Helpers:
 * borders.none/top/right/bottom/left/vertical/horizontal/all
 */

type EdgeSpec = boolean | IBorder;
type RadiusSpec = CompassCorners<BorderRadiusInput>;

const isRadiusCompass = (
  value: BorderIntent['radius'],
): value is RadiusSpec => typeof value === 'object' && value !== null;

export interface BorderIntent extends AxisValues<EdgeSpec> {
  radius?: RadiusSpec | 0 | null; // 0/null → explicit no radius
}

interface FinalBorderCSS {
  borderColor?: CSS.Property.BorderColor;
  borderStyle?: CSS.Property.BorderStyle;
  borderWidth?: CSS.Property.BorderWidth;
  borderRadius?: CSS.Property.BorderRadius;

  borderTopColor?: CSS.Property.BorderTopColor;
  borderRightColor?: CSS.Property.BorderRightColor;
  borderBottomColor?: CSS.Property.BorderBottomColor;
  borderLeftColor?: CSS.Property.BorderLeftColor;

  borderTopStyle?: CSS.Property.BorderTopStyle;
  borderRightStyle?: CSS.Property.BorderRightStyle;
  borderBottomStyle?: CSS.Property.BorderBottomStyle;
  borderLeftStyle?: CSS.Property.BorderLeftStyle;

  borderTopWidth?: CSS.Property.BorderTopWidth;
  borderRightWidth?: CSS.Property.BorderRightWidth;
  borderBottomWidth?: CSS.Property.BorderBottomWidth;
  borderLeftWidth?: CSS.Property.BorderLeftWidth;

  border?: 'none';
}

/* --------------------------
   Utilities
-------------------------- */

// number → px, IMeasurement → .css(), string passthrough
const toCssLen = (
  v: MeasurementLike | number | null | undefined,
): string | undefined => {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'number')
    return Number.isFinite(v) ? `${v}px` : undefined;
  if (isMeasurement(v)) return v.css();
  return undefined;
};

const fallbackWidth = (): string => toCssLen(borderVars.width) ?? '0';
const fallbackRadius = (): string =>
  toCssLen(borderVars.radius) ?? '0';
const fallbackStyle = (): CSS.Property.BorderStyle =>
  (borderVars.style as CSS.Property.BorderStyle) ?? 'solid';
const fallbackColor = (): string =>
  colorVars.border.css() ?? 'transparent';

const compressSides = (
  t: string,
  r: string,
  b: string,
  l: string,
) => {
  const allEq = t === r && r === b && b === l;
  if (allEq) return t;
  const vr = t === b;
  const hr = r === l;
  if (vr && hr) return `${t} ${r}`;
  if (hr) return `${t} ${r} ${b}`;
  return `${t} ${r} ${b} ${l}`;
};

const asWidth = (
  v: BorderWidthInput | undefined,
): string | undefined => {
  if (
    v &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    !('value' in v) &&
    !(typeof (v as { css?: unknown }).css === 'function')
  ) {
    // config object — no direct shorthand
    return undefined;
  }
  return (
    toCssLen(
      v as unknown as MeasurementLike | number | null | undefined,
    ) ?? undefined
  );
};

const asRadius = (
  v: BorderRadiusInput | undefined,
): string | undefined => {
  if (
    v &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    !('value' in v) &&
    !(typeof (v as { css?: unknown }).css === 'function')
  ) {
    return undefined;
  }
  return (
    toCssLen(
      v as unknown as MeasurementLike | number | null | undefined,
    ) ?? undefined
  );
};

/* --------------------------
   Intent resolution
-------------------------- */

type EdgeState = {
  active: boolean;
  width?: string;
  style?: CSS.Property.BorderStyle;
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
  if (spec === true) return { ...edge, active: true };

  // Narrow to object before property access
  if (typeof spec !== 'object' || spec === null) return edge;

  const next: EdgeState = { ...edge, active: true };

  if ('width' in spec && spec.width !== undefined) {
    next.width =
      asWidth((spec as { width?: BorderWidthInput }).width) ??
      fallbackWidth();
    next._wExp = true;
  }

  if ('style' in spec && spec.style !== undefined) {
    next.style = (
      spec as { style?: CSS.Property.BorderStyle }
    ).style!;
    next._sExp = true;
  }

  if (
    'color' in spec &&
    (spec as { color?: unknown }).color !== undefined
  ) {
    const c = (spec as { color?: unknown }).color;
    next.color =
      typeof c === 'string'
        ? c // 'transparent' / 'currentColor' etc.
        : hasCssMethod(c)
          ? c.css()
          : fallbackColor(); // dev-only: you can throw here if you prefer
    next._cExp = true;
  }

  return next;
};

const resolveIntentToEdges = (intent: BorderIntent | undefined) => {
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
  [
    t,
    r,
    b,
    l,
  ].forEach((e) => {
    if (e.active) {
      if (!e.width) e.width = dW;
      if (!e.style) e.style = dS;
      if (!e.color) e.color = dC;
    } else {
      e.width = '0';
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

const resolveRadiusCompass = (
  radius: BorderIntent['radius'],
  edges: ReturnType<typeof resolveIntentToEdges>,
): string | undefined => {
  if (radius === 0 || radius === null) return undefined;
  const rc = isRadiusCompass(radius) ? radius : undefined;

  const cornerVals: Partial<Record<Corner, string>> = {};
  const putIf = (c: Corner, v?: BorderRadiusInput) => {
    const val = asRadius(v);
    if (val) cornerVals[c] = val;
  };

  const allR = asRadius(rc?.all);
  if (allR)
    cornerVals.tl =
      cornerVals.tr =
      cornerVals.br =
      cornerVals.bl =
        allR;

  zoneKeys.forEach((zone) => {
    const zVal = asRadius(rc?.[zone]);
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

  const allEq = ftl === ftr && ftr === fbr && fbr === fbl;
  if (allEq) return ftl;

  const oppositeEq = ftl === fbr && ftr === fbl;
  if (oppositeEq) {
    const adjacentEq = ftl === ftr;
    if (!adjacentEq) return `${ftl} ${ftr}`;
  }

  if (ftr === fbl && ftl !== fbr) return `${ftl} ${ftr} ${fbr}`;

  return `${ftl} ${ftr} ${fbr} ${fbl}`;
};

/* --------------------------
   Main: border()
-------------------------- */

const resolve = (intent?: BorderIntent): FinalBorderCSS => {
  if (intent && 'all' in intent && intent.all === false) {
    // prefer borders.none()
  }

  const { t, r, b, l } = resolveIntentToEdges(intent ?? {});
  const anyActive = t.active || r.active || b.active || l.active;
  if (!anyActive) return {};

  const widths = [
    t.width!,
    r.width!,
    b.width!,
    l.width!,
  ];
  const styles = [
    t.style!,
    r.style!,
    b.style!,
    l.style!,
  ];
  const colors = [
    t.color!,
    r.color!,
    b.color!,
    l.color!,
  ];

  const styleAllEq = styles.every((s) => s === styles[0]);
  const colorAllEq = colors.every((c) => c === colors[0]);

  const css: FinalBorderCSS = {};

  const [
    tw,
    rw,
    bw,
    lw,
  ] = widths;
  css.borderWidth = compressSides(tw, rw, bw, lw);

  if (styleAllEq) {
    css.borderStyle = styles[0];
  } else {
    css.borderTopStyle = styles[0] as CSS.Property.BorderTopStyle;
    css.borderRightStyle = styles[1] as CSS.Property.BorderRightStyle;
    css.borderBottomStyle =
      styles[2] as CSS.Property.BorderBottomStyle;
    css.borderLeftStyle = styles[3] as CSS.Property.BorderLeftStyle;
  }

  if (colorAllEq) {
    css.borderColor = colors[0];
  } else {
    css.borderTopColor = colors[0];
    css.borderRightColor = colors[1];
    css.borderBottomColor = colors[2];
    css.borderLeftColor = colors[3];
  }

  const radiusVal = resolveRadiusCompass(intent?.radius, {
    t,
    r,
    b,
    l,
  });
  if (radiusVal && radiusVal !== '0' && radiusVal !== '0px') {
    css.borderRadius = radiusVal;
  }

  return css;
};

/* --------------------------
   Public API
-------------------------- */

export const borders = Object.assign(
  (intent?: BorderIntent): FinalBorderCSS => resolve(intent),
  {
    none(): FinalBorderCSS {
      return { border: 'none' };
    },
    top(overrides?: IBorder): FinalBorderCSS {
      return resolve({ top: overrides ?? true });
    },
    right(overrides?: IBorder): FinalBorderCSS {
      return resolve({ right: overrides ?? true });
    },
    bottom(overrides?: IBorder): FinalBorderCSS {
      return resolve({ bottom: overrides ?? true });
    },
    left(overrides?: IBorder): FinalBorderCSS {
      return resolve({ left: overrides ?? true });
    },
    vertical(overrides?: IBorder): FinalBorderCSS {
      return resolve({ vertical: overrides ?? true });
    },
    horizontal(overrides?: IBorder): FinalBorderCSS {
      return resolve({ horizontal: overrides ?? true });
    },
    all(overrides?: IBorder): FinalBorderCSS {
      return resolve({ all: overrides ?? true });
    },
  },
);

export default borders;
