export interface IArch {
  containerHeight: number; // Space above the arch, the space for the nav items
  curveHeight: number; // This is the height of the arch under the containerHeight. Full height is containerHeight + curveHeight
  maskOffset: number; // Modifies curve of arch. the higher this number, the more round, the lower, the more flat.
  bumpHeight: number; // Height of the "bump" in the middle of the arch
  bumpWidth: number; // Width of the "bump" at the base, the part touching the arch
  bumpRoundness: number; // Roundness of "bump"
  bumpSpan: number; // This adjusts how wide the "bump" is at the tip
}

interface IProps extends IArch {
  width: number;
}

/** Return a SINGLE-PATH "d" for the nav arch + optional OUTWARD bulge */
export function archNavPath(props: IProps) {
  const {
    W = props.width,
    top,
    curve,
    ry = 120,
    bulgeDepth = 0,
    bulgeWidth = 0,
    shoulder = 0.42,
    tipRound = 2.3,
    forceConcaveUp = true,
  } = props;

  const f = (n) => Number(n.toFixed(6));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function rxFrom(W, curve, ry) {
    const c = curve / ry;
    const denom = Math.max(1e-6, 2 * c - c * c);
    return W / 2 / Math.sqrt(denom);
  }
  function yEllipse(cx, cy, rx, ry, x) {
    const dx = (x - cx) / rx;
    const t = 1 - dx * dx;
    const root = Math.sqrt(Math.max(0, t));
    return cy - ry * root;
  }
  function tangentAtX(cx, cy, rx, ry, x) {
    const cosT = clamp((x - cx) / rx, -1, 1);
    const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
    const tx = -rx * sinT,
      ty = -ry * cosT;
    const L = Math.hypot(tx, ty) || 1;
    return { tx: tx / L, ty: ty / L };
  }

  function archPath(o = {}) {
    const W = Math.max(200, +o.width || 1200);
    const top = Math.max(0, +o.top || 100);
    const curve = Math.max(10, +o.curve || 80);
    const ry = Math.max(curve + 4, +o.ry || 120);
    const H = top + curve;

    const cx = W / 2,
      cy = top + ry;
    const rx = rxFrom(W, curve, ry);

    const half = Math.max(
      12,
      Math.min((+o.bulgeWidth || 240) / 2, rx - 6, W / 2 - 6),
    );
    const xL = cx - half,
      xR = cx + half;
    const yA = yEllipse(cx, cy, rx, ry, cx);
    const yL = yEllipse(cx, cy, rx, ry, xL);
    const yR = yEllipse(cx, cy, rx, ry, xR);
    const maxDepth = H - yA - 1.0;
    const depth = clamp(+o.bulgeHeight || 28, 0, maxDepth);
    const tipY = yA + depth;

    const tR = tangentAtX(cx, cy, rx, ry, xR);
    const tL = tangentAtX(cx, cy, rx, ry, xL);
    const vRx = cx - xR,
      vRy = tipY - yR;
    if (tR.tx * vRx + tR.ty * vRy < 0) {
      tR.tx *= -1;
      tR.ty *= -1;
    }
    const vLx = cx - xL,
      vLy = tipY - yL;
    if (tL.tx * vLx + tL.ty * vLy < 0) {
      tL.tx *= -1;
      tL.ty *= -1;
    }

    const chordR = Math.hypot(vRx, vRy),
      chordL = Math.hypot(vLx, vLy);
    const chord = 0.5 * (chordR + chordL);
    const joinToTip = Math.max(6, Math.hypot(cx - xR, tipY - yR));
    const rnd = clamp(+o.roundness ?? 0.6, 0, 1);

    const Ls = Math.max(
      8,
      Math.min(
        (0.22 + 0.6 * rnd) * chord,
        joinToTip * 0.7,
        half * 0.75,
        (depth + 8) * 1.2,
      ),
    );
    let tspan =
      typeof o.tipSpan === 'number'
        ? Math.abs(o.tipSpan)
        : Math.max(
            8,
            Math.min(
              half * 0.25,
              (0.35 + 0.5 * rnd) * Math.sqrt(Math.max(1, depth)) * 1.25,
            ),
          );
    tspan = Math.min(tspan, half - 6);

    const c1x = xR + tR.tx * Ls,
      c1y = yR + tR.ty * Ls;
    const c4x = xL + tL.tx * Ls,
      c4y = yL + tL.ty * Ls;
    // Corrected tip flow: first cubic ends with control to the RIGHT of tip,
    // second cubic starts with control to the LEFT of tip (both tangents leftward).
    const c2x = cx + tspan,
      c2y = tipY;
    const c3x = cx - tspan,
      c3y = tipY;

    const nR = Math.max(48, Math.round((W - xR) / 12));
    const nL = Math.max(48, Math.round(xL / 12));

    let d = `M 0 0 H ${f(W)} V ${f(H)}`;

    for (let i = 0; i <= nR; i++) {
      const t = i / nR;
      const x = W - t * (W - xR);
      const y = Math.min(yEllipse(cx, cy, rx, ry, x), H - 1e-3);
      d += ` L ${f(x)} ${f(y)}`;
    }
    d += ` C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(cx)} ${f(tipY)}`;
    d += ` C ${f(c3x)} ${f(c3y)} ${f(c4x)} ${f(c4y)} ${f(xL)} ${f(yL)}`;

    for (let i = 1; i <= nL; i++) {
      const t = i / nL;
      const x = xL * (1 - t);
      const y = Math.min(yEllipse(cx, cy, rx, ry, x), H - 1e-3);
      d += ` L ${f(x)} ${f(y)}`;
    }
    d += ` L 0 ${f(H)} Z`;

    //   return { d, width: W, height: H };
    return d;
  }
}
