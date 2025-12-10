import { m, type IMeasurement } from 'css-calipers';
import { menuVars } from '../../styles/componentTokens/menu.componentTokens';
import transforms from '../../styles/helpers/transforms.helper';

export interface IArch {
  top: IMeasurement; // Space above the top of the arch (reserved for nav items)
  curveHeight: IMeasurement; // Height of the curved portion
  // Note that the total height is top + curveHeight
  ry: IMeasurement; // Offset of the ellipsis used to punch out the arch shape. (>= curveHeight + 4)
  bumpHeight: IMeasurement; // Height of bump in middle of arch
  bumpWidth: IMeasurement; // Width of base of bump in the middle
  bumpBaseWidth: number; // (0 to 1) - Width of base of bump (wider or shorter slope)
  bumpTipWidth: IMeasurement; // controls control-point spread at the tip
}

interface IProps extends IArch {
  width: number;
}

export function generateArchPaths(p: IProps) {
  const f = (n: number) => Number(n.toFixed(6));
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  const rxFrom = (W: number, curveHeight: number, ry: number) => {
    const c = curveHeight / ry;
    const denom = Math.max(1e-6, 2 * c - c * c);
    return W / 2 / Math.sqrt(denom);
  };

  const yEllipse = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    x: number,
  ) => {
    const dx = (x - cx) / rx;
    const t = 1 - dx * dx;
    const root = Math.sqrt(Math.max(0, t));
    return cy - ry * root;
  };

  const tangentAtX = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    x: number,
  ) => {
    const cosT = clamp((x - cx) / rx, -1, 1);
    const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
    const tx0 = -rx * sinT;
    const ty0 = -ry * cosT;
    const L = Math.hypot(tx0, ty0) || 1;
    return { tx: tx0 / L, ty: ty0 / L };
  };

  // --- Geometry base
  const W = Math.max(200, p.width);
  const top = Math.max(0, p.top.getValue());
  const curveHeight = Math.max(10, p.curveHeight.getValue());
  const ry = Math.max(curveHeight + 4, p.ry.getValue());
  const H = top + curveHeight;

  const cx = W / 2;
  const cy = top + ry;
  const rx = rxFrom(W, curveHeight, ry);

  // --- Bump geometry
  const bumpWidthValue = p.bumpWidth.getValue();
  const half = Math.max(
    12,
    Math.min(bumpWidthValue / 2, rx - 6, W / 2 - 6),
  );
  const xL = cx - half;
  const xR = cx + half;

  const yA = yEllipse(cx, cy, rx, ry, cx);
  const yL = yEllipse(cx, cy, rx, ry, xL);
  const yR = yEllipse(cx, cy, rx, ry, xR);
  const yW = Math.min(yEllipse(cx, cy, rx, ry, W), H - 1e-3);

  const maxDepth = H - yA - 1.0;
  const depth = clamp(p.bumpHeight.getValue(), 0, maxDepth);
  const tipY = yA + depth;

  const tR0 = tangentAtX(cx, cy, rx, ry, xR);
  const tL0 = tangentAtX(cx, cy, rx, ry, xL);

  const vRx = cx - xR,
    vRy = tipY - yR;
  const dotR = tR0.tx * vRx + tR0.ty * vRy;
  const tR = dotR < 0 ? { tx: -tR0.tx, ty: -tR0.ty } : tR0;

  const vLx = cx - xL,
    vLy = tipY - yL;
  const dotL = tL0.tx * vLx + tL0.ty * vLy;
  const tL = dotL < 0 ? { tx: -tL0.tx, ty: -tL0.ty } : tL0;

  const chordR = Math.hypot(vRx, vRy);
  const chordL = Math.hypot(vLx, vLy);
  const chord = 0.5 * (chordR + chordL);
  const joinToTip = Math.max(6, Math.hypot(cx - xR, tipY - yR));
  const rnd = clamp(p.bumpBaseWidth, 0, 1);

  const Ls = Math.max(
    8,
    Math.min(
      (0.22 + 0.6 * rnd) * chord,
      joinToTip * 0.7,
      half * 0.75,
      (depth + 8) * 1.2,
    ),
  );

  const tspanRaw = p.bumpTipWidth.getValue();
  const tspanClamped = Math.max(8, Math.min(tspanRaw, half - 6));
  const c2x = cx + tspanClamped,
    c2y = tipY;
  const c3x = cx - tspanClamped,
    c3y = tipY;

  const c1x = xR + tR.tx * Ls,
    c1y = yR + tR.ty * Ls;
  const c4x = xL + tL.tx * Ls,
    c4y = yL + tL.ty * Ls;

  const nR = Math.max(48, Math.round((W - xR) / 12));
  const nL = Math.max(48, Math.round(xL / 12));

  const head = `M 0 0 H ${f(W)} V ${f(H)}`;
  const rightEdge = new Array(nR + 1)
    .fill(0)
    .map((_, i) => {
      const t = i / nR;
      const x = W - t * (W - xR);
      const y = Math.min(yEllipse(cx, cy, rx, ry, x), H - 1e-3);
      return ` L ${f(x)} ${f(y)}`;
    })
    .join('');

  const bump =
    ` C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(cx)} ${f(tipY)}` +
    ` C ${f(c3x)} ${f(c3y)} ${f(c4x)} ${f(c4y)} ${f(xL)} ${f(yL)}`;

  const leftEdge = new Array(nL)
    .fill(0)
    .map((_, i) => {
      const t = (i + 1) / nL;
      const x = xL * (1 - t);
      const y = Math.min(yEllipse(cx, cy, rx, ry, x), H - 1e-3);
      return ` L ${f(x)} ${f(y)}`;
    })
    .join('');

  const tail = ` L 0 ${f(H)} Z`;

  const archD = head + rightEdge + bump + leftEdge + tail;

  // Right ellipse segment: from right corner (W,yW) down to the join (xR,yR)
  // Skip i=0 to avoid repeating the move point.
  const rightEdgeForRim = new Array(nR)
    .fill(0)
    .map((_, i) => {
      const t = (i + 1) / nR; // 1..nR
      const x = W - t * (W - xR);
      const y = Math.min(yEllipse(cx, cy, rx, ry, x), H - 1e-3);
      return ` L ${f(x)} ${f(y)}`;
    })
    .join('');

  // Left ellipse segment: from the join (xL,yL) to the left corner (0,y0)
  // Again start at i=1 to step away from the join point.
  const leftEdgeForRim = new Array(nL)
    .fill(0)
    .map((_, i) => {
      const t = (i + 1) / nL; // 1..nL
      const x = xL * (1 - t); // → 0
      const y = Math.min(yEllipse(cx, cy, rx, ry, x), H - 1e-3);
      return ` L ${f(x)} ${f(y)}`;
    })
    .join('');

  const bottomCurveD =
    `M ${f(W)} ${f(yW)}` + // start at bottom-right corner
    rightEdgeForRim + // along ellipse to (xR,yR)
    bump + // the two cubic segments across the tip to (xL,yL)
    leftEdgeForRim; // along ellipse to bottom-left corner

  return {
    archD,
    bottomCurveD,
    width: W,
    height: H,
  };
}

export function generateArchPath(p: IProps) {
  return generateArchPaths(p).archD;
}

export function getRotationStyle(
  direction: 'left' | 'right',
  width: number,
  opts: {
    max?: number;
    min?: number;
    k?: number;
  } = {},
): React.CSSProperties {
  const {
    max = menuVars.rotation.max,
    min = 0,
    k = menuVars.rotation.k,
  } = opts;

  const intents = [];
  if (width <= 0) {
    intents.push({
      rotate: { value: m(0, 'deg') },
    });
  } else {
    const magnitude = min + (max - min) * Math.exp(-width / k);
    intents.push({
      rotate: {
        value: m(magnitude, 'deg').negation(direction === 'left'),
      },
    });
  }
  return transforms.style(...intents);
}
