import * as CSS from 'csstype';
import { borderVars, colorVars } from '../vars';
import type {
	IBorder,
	BorderWidthInput,
	BorderRadiusInput,
} from '../vars';
import { toCssMeasurement, toCssColor } from './style';

/**
 * Public UX:
 *
 * Border({ bottom: true, // use ambient defaults for bottom // or
 * bottom: { width: m(6) } // override per intent radius: { south:
 * m(8) }, // compass radius: north/south/east/west/nw/ne/se/sw/all
 * })
 *
 * Also available helpers: border.none() border.top(overrides?)
 * border.right(overrides?) border.bottom(overrides?)
 * border.left(overrides?) border.vertical(overrides?) // (top+bottom)
 * border.horizontal(overrides?)// (left+right)
 */

type EdgeKey =
	| 'all'
	| 'vertical'
	| 'horizontal'
	| 'top'
	| 'right'
	| 'bottom'
	| 'left';
type CornerKey = 'nw' | 'ne' | 'se' | 'sw';
type ZoneKey = 'north' | 'south' | 'east' | 'west';

type EdgeSpec = boolean | IBorder;

export interface BorderIntent {
	all?: EdgeSpec;
	vertical?: EdgeSpec;
	horizontal?: EdgeSpec;
	top?: EdgeSpec;
	right?: EdgeSpec;
	bottom?: EdgeSpec;
	left?: EdgeSpec;
	radius?: RadiusCompass | 0 | null; // 0/null → explicit no radius
}

export type RadiusCompass = {
	all?: BorderRadiusInput;
	// zones (pairs of corners)
	north?: BorderRadiusInput; // top-left + top-right
	south?: BorderRadiusInput; // bottom-left + bottom-right
	east?: BorderRadiusInput; // top-right + bottom-right
	west?: BorderRadiusInput; // top-left + bottom-left
	// individual corners
	nw?: BorderRadiusInput;
	ne?: BorderRadiusInput;
	se?: BorderRadiusInput;
	sw?: BorderRadiusInput;
};

interface FinalBorderCSS {
	// global shorthands when possible
	borderColor?: CSS.Property.BorderColor;
	borderStyle?: CSS.Property.BorderStyle;
	borderWidth?: CSS.Property.BorderWidth;
	borderRadius?: CSS.Property.BorderRadius;
	// per-edge fallbacks if values differ
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

	// convenience for hard-off
	border?: 'none';
}

/* --------------------------
   Utilities
-------------------------- */

const fallbackWidth = (): string =>
	toCssMeasurement(borderVars.width) ?? '0';
const fallbackRadius = (): string =>
	toCssMeasurement(borderVars.radius) ?? '0';
const fallbackStyle = (): CSS.Property.BorderStyle =>
	(borderVars.style as CSS.Property.BorderStyle) ?? 'solid';
const fallbackColor = (): string => toCssColor(colorVars.border);

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
): string | undefined => toCssMeasurement(v) ?? undefined;
const asRadius = (
	v: BorderRadiusInput | undefined,
): string | undefined => toCssMeasurement(v) ?? undefined;

/* --------------------------
   Intent resolution
-------------------------- */

type EdgeState = {
	active: boolean;
	// resolved per-edge overrides (strings only)
	width?: string;
	style?: CSS.Property.BorderStyle;
	color?: string;
	// did the width/style/color come from an explicit override (vs default)?
	_wExp?: boolean;
	_sExp?: boolean;
	_cExp?: boolean;
};

const emptyEdge = (): EdgeState => ({ active: false });

const applyEdgeSpec = (
	edge: EdgeState,
	spec?: EdgeSpec,
): EdgeState => {
	if (spec === undefined) return edge;
	if (spec === false) return edge; // ignored; use absence rather than false to deactivate
	const next: EdgeState = { ...edge, active: true };
	if (spec !== true) {
		if (spec.width !== undefined) {
			next.width = asWidth(spec.width) ?? fallbackWidth();
			next._wExp = true;
		}
		if (spec.style !== undefined) {
			next.style = spec.style as CSS.Property.BorderStyle;
			next._sExp = true;
		}
		if (spec.color !== undefined) {
			next.color = toCssColor(spec.color);
			next._cExp = true;
		}
	}
	return next;
};

const resolveIntentToEdges = (intent: BorderIntent | undefined) => {
	const t = emptyEdge(),
		r = emptyEdge(),
		b = emptyEdge(),
		l = emptyEdge();

	// 1) all
	if (intent?.all !== undefined) {
		[
			t,
			r,
			b,
			l,
		].forEach((e) => applyEdgeSpec(e, intent.all));
	}

	// 2) vertical / horizontal
	if (intent?.vertical !== undefined) {
		applyEdgeSpec(t, intent.vertical);
		applyEdgeSpec(b, intent.vertical);
	}
	if (intent?.horizontal !== undefined) {
		applyEdgeSpec(l, intent.horizontal);
		applyEdgeSpec(r, intent.horizontal);
	}

	// 3) top/right/bottom/left (highest precedence)
	if (intent?.top !== undefined) applyEdgeSpec(t, intent.top);
	if (intent?.right !== undefined) applyEdgeSpec(r, intent.right);
	if (intent?.bottom !== undefined) applyEdgeSpec(b, intent.bottom);
	if (intent?.left !== undefined) applyEdgeSpec(l, intent.left);

	// Fill defaults where active but unspecified
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
			e.width = '0'; // inactive edges collapse via width=0
		}
	});

	return { t, r, b, l };
};

/* --------------------------
   Radius resolution (compass)
-------------------------- */

type Corner = 'tl' | 'tr' | 'br' | 'bl';

const cornersForZone: Record<ZoneKey, Corner[]> = {
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

const resolveRadiusCompass = (
	radius: BorderIntent['radius'],
	edges: ReturnType<typeof resolveIntentToEdges>,
): string | undefined => {
	if (radius === 0 || radius === null) return undefined; // explicit opt-out
	const rc = radius ?? {}; // undefined → empty object (no radius unless explicit corner/zone)

	// Build corner map from inputs with precedence: corners > zones > all
	const cornerVals: Partial<Record<Corner, string>> = {};
	const putIf = (c: Corner, v?: BorderRadiusInput) => {
		const val = asRadius(v);
		if (val) cornerVals[c] = val;
	};

	// start from 'all'
	const allR = asRadius((rc as RadiusCompass).all);
	if (allR) {
		cornerVals.tl = allR;
		cornerVals.tr = allR;
		cornerVals.br = allR;
		cornerVals.bl = allR;
	}

	// zones
	(
		[
			'north',
			'south',
			'east',
			'west',
		] as ZoneKey[]
	).forEach((zone) => {
		const zVal = asRadius((rc as RadiusCompass)[zone]);
		if (zVal)
			cornersForZone[zone].forEach((c) => (cornerVals[c] = zVal));
	});

	// corners (highest precedence)
	putIf('tl', (rc as RadiusCompass).nw);
	putIf('tr', (rc as RadiusCompass).ne);
	putIf('br', (rc as RadiusCompass).se);
	putIf('bl', (rc as RadiusCompass).sw);

	// If no values were provided, don't emit borderRadius at all by default
	const anyProvided = Object.keys(cornerVals).length > 0;
	if (!anyProvided) return undefined;

	// Relevance rule: emit a corner radius only if at least one adjacent edge is active,
	// unless that corner was *explicitly* set via corner key (nw/ne/se/sw).
	// We detect explicit corner set by checking presence in rc with those keys.
	const explicitCorners = new Set<Corner>();
	if ((rc as RadiusCompass).nw !== undefined)
		explicitCorners.add('tl');
	if ((rc as RadiusCompass).ne !== undefined)
		explicitCorners.add('tr');
	if ((rc as RadiusCompass).se !== undefined)
		explicitCorners.add('br');
	if ((rc as RadiusCompass).sw !== undefined)
		explicitCorners.add('bl');

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

	// If all filtered away, don't emit
	if (!tl && !tr && !br && !bl) return undefined;

	// Fill missing with 0 (to ensure stable shorthand) but minimize with compression
	const ftl = tl ?? '0';
	const ftr = tr ?? '0';
	const fbr = br ?? '0';
	const fbl = bl ?? '0';

	// Compress 1/2/3/4 values like CSS border-radius:
	// tl tr br bl (we keep the classic 4-value syntax, then rely on CSS compression rules)
	const allEq = ftl === ftr && ftr === fbr && fbr === fbl;
	if (allEq) return ftl;

	const oppositeEq = ftl === fbr && ftr === fbl;
	if (oppositeEq) {
		const adjacentEq = ftl === ftr; // tl==tr && br==bl imply allEq (caught above), so only case left is 2 values
		if (!adjacentEq) return `${ftl} ${ftr}`; // tl==br, tr==bl
	}

	// 3-value compression (tl, tr/bl, br) only applies if tr==bl, but tl!=br
	if (ftr === fbl && ftl !== fbr) return `${ftl} ${ftr} ${fbr}`;

	// 4 values
	return `${ftl} ${ftr} ${fbr} ${fbl}`;
};

/* --------------------------
   Main: border()
-------------------------- */

const resolve = (intent?: BorderIntent): FinalBorderCSS => {
	// Hard off
	if (intent && 'all' in intent && intent.all === false) {
		// not a supported pattern; use border.none() if you need explicit off
	}

	const { t, r, b, l } = resolveIntentToEdges(intent ?? {});

	// If no edges active, return nothing (or none if you prefer)
	const anyActive = t.active || r.active || b.active || l.active;
	if (!anyActive) return {};

	// Resolve per-edge values (strings ensured)
	const widths = [
		t.width!,
		r.width!,
		b.width!,
		l.width!,
	];

	// Styles & colors: prefer global shorthand if all equal
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

	// Width: we can safely use shorthand unless a caller really needs per-edge properties;
	// if you prefer per-edge for clarity, uncomment the verbose assignments below.
	const [
		tw,
		rw,
		bw,
		lw,
	] = widths;
	const widthShorthand = compressSides(tw, rw, bw, lw);
	css.borderWidth = widthShorthand;

	// Style
	if (styleAllEq) {
		css.borderStyle = styles[0];
	} else {
		css.borderTopStyle = styles[0];
		css.borderRightStyle = styles[1];
		css.borderBottomStyle = styles[2];
		css.borderLeftStyle = styles[3];
	}

	// Color
	if (colorAllEq) {
		css.borderColor = colors[0];
	} else {
		css.borderTopColor = colors[0];
		css.borderRightColor = colors[1];
		css.borderBottomColor = colors[2];
		css.borderLeftColor = colors[3];
	}

	// Radius — only emit when relevant / requested
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
  }
);

export default borders;
