// archNavPath.js — single-path nav arch with optional OUTWARD bulge
// Exports:
//   - archNavPath(params): returns an SVG path "d" string
//   - buildNavSVG(params): returns a complete <svg> string (one <path>)
// Usage:
//   import { archNavPath, buildNavSVG } from './archNavPath.js';
//   const d = archNavPath({ width: 1200, top: 100, curve: 80, ry: 120, bulgeDepth: 30, bulgeWidth: 230, shoulder: 0.42, tipRound: 2.3 });
//   // <path d={d} fill="currentColor"/>
//
// All units are pixels. Coordinate system: y grows downward.
// Apex of the arch is exactly at y = top.
// Total height = top + curve. Bottom corners are (0,H) and (W,H).

/**
 * @typedef {Object} ArchParams
 * @property {number} width Total width (W)
 * @property {number} top Minimum space above the arch apex
 * @property {number} curve Extra height under the apex (total height =
 *   top+curve)
 * @property {number} [ry=120] Base ellipse y-radius (will be clamped so shape
 *   cannot invert). Default is `120`
 * @property {number} [bulgeDepth=0] Pixels below the base ellipse at the center
 *   (0 = no bulge). Default is `0`
 * @property {number} [bulgeWidth=0] Distance between the two join points on the
 *   ellipse (0 = no bulge). Default is `0`
 * @property {number} [shoulder=0.42] Shoulder handle scale (0..1) — smaller =
 *   softer entry, larger = tighter. Default is `0.42`
 * @property {number} [tipRound=2.3] Tip rounding factor — scales mirrored
 *   vertical handles at tip. Default is `2.3`
 * @property {boolean} [forceConcaveUp=true] Internal orientation guard (leave
 *   true). Default is `true`
 */

/** Format to fixed decimals without trailing noise */
function f(n) {
	return Number(n.toFixed(6));
}

/** Clamp helper */
function clamp(v, lo, hi) {
	return Math.max(lo, Math.min(hi, v));
}

/**
 * Compute rx so the ellipse with center (cx,cy) and ry passes through (0,H) and
 * (W,H).
 */
function rxForCorners(W, H, cy, ry) {
	const term = 1 - Math.pow((H - cy) / ry, 2);
	return W / 2 / Math.sqrt(Math.max(term, 1e-12));
}

/** Y on the UPPER branch of the ellipse (the arch line) at x */
function yUpperOnEllipse(cx, cy, rx, ry, x) {
	const dx = x - cx;
	const t = 1 - (dx * dx) / (rx * rx);
	return cy - ry * Math.sqrt(Math.max(0, t));
}

/** Unit tangent vector on the UPPER branch at x */
function unitTangentAtX(cx, cy, rx, ry, x) {
	const y = yUpperOnEllipse(cx, cy, rx, ry, x);
	const cosT = clamp((x - cx) / rx, -1, 1);
	const sinT = (y - cy) / ry; // negative on upper branch
	// param ellipse derivative (-a sin t, b cos t)
	const a = rx,
		b = ry;
	let tx = -a * sinT,
		ty = b * cosT;
	const L = Math.hypot(tx, ty) || 1;
	return [tx / L, ty / L, y];
}

/** Return a SINGLE-PATH "d" for the nav arch + optional OUTWARD bulge */
export function archNavPath(params) {
	const {
		width: W,
		top,
		curve,
		ry = 120,
		bulgeDepth = 0,
		bulgeWidth = 0,
		shoulder = 0.42,
		tipRound = 2.3,
		forceConcaveUp = true,
	} = params;

	if (!(W > 0) || !(top >= 0) || !(curve > 0))
		throw new Error('width>0, top>=0, curve>0 are required');

	const H = top + curve;
	// Anti-flip guard: ensure ellipse center is at/below bottom edge so rx stays real
	const ryUsed = Math.max(ry, curve + 0.01);
	const cx = W / 2;
	const cy = top + ryUsed;
	const rx = rxForCorners(W, H, cy, ryUsed);
	const sweep = cy > H || forceConcaveUp ? 0 : 1; // typical case: 0

	// No bulge => exact two-arc base
	if (bulgeDepth <= 0 || bulgeWidth <= 0) {
		return [
			`M 0 0`,
			`H ${f(W)}`,
			`V ${f(H)}`,
			`A ${f(rx)} ${f(ryUsed)} 0 0 ${sweep} ${f(cx)} ${f(top)}`,
			`A ${f(rx)} ${f(ryUsed)} 0 0 ${sweep} 0 ${f(H)}`,
			`Z`,
		].join(' ');
	}

	// Bulge join points at ± bulgeWidth/2, clamped to ellipse extent
	const half = Math.max(8, Math.min(bulgeWidth / 2, rx - 2, W / 2 - 2));
	const xR = cx + half,
		xL = cx - half;
	const [tRx, tRy, yR] = unitTangentAtX(cx, cy, rx, ryUsed, xR);
	const [_tLx, _tLy, yL] = unitTangentAtX(cx, cy, rx, ryUsed, xL);
	// mirror the tangent horizontally for the left side to stay symmetric
	let tLx = -tRx,
		tLy = tRy;

	// Tip: OUTWARD (down) from the center of arch
	const yC = yUpperOnEllipse(cx, cy, rx, ryUsed, cx); // equals 'top'
	const tipX = cx;
	const tipY = Math.min(H - 1e-3, yC + Math.max(0, bulgeDepth));

	// Make sure join tangents point toward the tip (avoid inward-pinched shoulders)
	const vRx = tipX - xR,
		vRy = tipY - yR;
	if (tRx * vRx + tRy * vRy < 0) {
		// flip right tangent
		// when the ellipse is very shallow, the param tangent may face away; flip it
		var _tRx = -tRx,
			_tRy = -tRy;
		tLx = -_tRx;
		tLy = _tRy;
	}

	// Shoulder handle length (clamped) — smaller for softer entry
	const chordR = Math.hypot(vRx, vRy);
	const chordL = Math.hypot(tipX - xL, tipY - yL);
	const chord = 0.5 * (chordR + chordL);
	const L1 = Math.max(
		6,
		Math.min((0.25 + 0.55 * clamp(shoulder, 0, 1)) * chord, half * 0.75),
	);

	// Rounder tip by stretching the mirrored vertical handles
	const Lc = clamp(tipRound, 0.5, 4.0) * (tipY - yC);

	// Control points
	const c1x = xR + tRx * L1,
		c1y = yR + tRy * L1;
	const c4x = xL + tLx * L1,
		c4y = yL + tLy * L1;
	const c2x = tipX,
		c2y = tipY - Lc; // mirrored vertical at tip
	const c3x = tipX,
		c3y = tipY - Lc;

	// Single path: rect → corner → arc→join → cubic→tip → cubic→join → arc→corner → close
	return [
		`M 0 0`,
		`H ${f(W)}`,
		`V ${f(H)}`,
		`A ${f(rx)} ${f(ryUsed)} 0 0 ${sweep} ${f(xR)} ${f(yR)}`,
		`C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(tipX)} ${f(tipY)}`,
		`C ${f(c3x)} ${f(c3y)} ${f(c4x)} ${f(c4y)} ${f(xL)} ${f(yL)}`,
		`A ${f(rx)} ${f(ryUsed)} 0 0 ${sweep} 0 ${f(H)}`,
		`Z`,
	].join(' ');
}

/** Build a complete one-path SVG string */
export function buildNavSVG(params) {
	const { width: W, top, curve, fill = 'currentColor' } = params;
	const H = top + curve;
	const d = archNavPath(params);
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}" width="${f(W)}" height="${f(H)}" preserveAspectRatio="none">
  <path d="${d}" fill="${fill}"/>
</svg>`;
}

// CommonJS fallback (optional)
try {
	if (typeof module !== 'undefined')
		module.exports = { archNavPath, buildNavSVG };
} catch {}
