import { m, assertUnit } from '@/styles/helpers/measurement';

/* =========================
   KNOBS (base measurements)
   ========================= */

export const offsetPx = m(26, 'px');
export const buttonSizePx = m(66, 'px');
export const iconSizePx = m(36, 'px');

export const shuttleDurationMs = m(700, 'ms');
export const shuttleExitDurationMs = shuttleDurationMs;

export const entryOvershootPx = m(14, 'px');
export const exitPushPx = m(22, 'px');

export const entryOvershootSoftPx = entryOvershootPx.multiply(0.7);
export const exitPushSoftPx = exitPushPx.multiply(0.9);

export const rotNeg45Deg = m(-45, 'deg');
export const rot45Deg = m(45, 'deg');
export const gradAngle135Deg = m(135, 'deg');

export const iconExitTotalMs = m(500, 'ms');
export const iconWindupDeg = m(20, 'deg');
export const iconOvershootDeg = m(-8, 'deg');
export const iconFinalDeg = m(-180, 'deg');
export const iconBaseDeg = m(0, 'deg');

/* =========================
   TIMING REFS (no extra waits)
   ========================= */

export const shuttleStartRatio = 0; // <- no pre-delay
export const shuttleStartOffsetMs = m(0, 'ms');
export const springDelayMs = m(80, 'ms');
export const exitTranslationDelayMs = m(0, 'ms'); // immediate exit start

export const iconLagInDistancePx = m(8, 'px');
export const iconLagInMicroPx = m(0.8, 'px');
export const iconLagInDurationMs = m(160, 'ms');
export const iconLagOutDistancePx = m(3, 'px');
export const iconLagOutDurationMs = shuttleExitDurationMs;

export const radiusCirclePct = m(50, '%');
export const hoverTransitionMs = m(220, 'ms');
export const gradientFadeMs = m(200, 'ms');

/* =========================
   ICON SCALE (rotate-sandwich)
   ========================= */

export const iconStretch = 1.05;
export const iconSquash = 1 / iconStretch;
export const iconScaleEnterMs = m(180, 'ms');
export const iconScaleExitMs = m(240, 'ms');
export const iconScaleDelayInMs = springDelayMs.add(m(40, 'ms'));
export const iconScaleDelayOutMs = springDelayMs.add(m(40, 'ms'));

/* =========================
   SQUASH & STRETCH
   ========================= */

export const scaleEnterDurationMs = m(260, 'ms');
export const scaleExitDurationMs = m(420, 'ms');
export const scaleDelayEnterMs = m(0, 'ms');
export const scaleDelayExitMs = exitTranslationDelayMs;

export const stretch = 1.06;
export const squash = 1 / stretch;
export const stretchExit = stretch;
export const squashExit = 1 / stretchExit;

/* =========================
   DERIVED GEOMETRY
   ========================= */

export const containerSizePx = buttonSizePx.multiply(3.6);
export const diagonalOffsetPx = offsetPx.multiply(Math.SQRT2);

/* =========================
   TRANSFORM STRINGS
   ========================= */

export const t3dInset = () =>
  `translate3d(${diagonalOffsetPx.css()},0,0)`;
export const t3dOffscreen = () => `translate3d(-50px,0,0)`;
export const t3dOvershootInSoft = () =>
  `translate3d(calc(${diagonalOffsetPx.css()} + ${entryOvershootSoftPx.css()}),0,0)`;
export const t3dPushedOutSoft = () =>
  `translate3d(calc(${diagonalOffsetPx.css()} + ${exitPushSoftPx.css()}),0,0)`;

/* =========================
   ACCESSIBILITY / HOVER
   ========================= */

// Added (were missing in your file)
export const hoverBlurPx = m(10, 'px');
export const focusWidthPx = m(2, 'px');
export const focusOffsetPx = m(2, 'px');

/* =========================
   DEV UNIT CHECKS
   ========================= */

if (process.env.NODE_ENV !== 'production') {
  assertUnit(offsetPx, 'px', 'offsetPx');
  assertUnit(buttonSizePx, 'px', 'buttonSizePx');
  assertUnit(iconSizePx, 'px', 'iconSizePx');
  assertUnit(entryOvershootPx, 'px', 'entryOvershootPx');
  assertUnit(exitPushPx, 'px', 'exitPushPx');
  assertUnit(diagonalOffsetPx, 'px', 'diagonalOffsetPx');
  assertUnit(radiusCirclePct, '%', 'radiusCirclePct');
  assertUnit(rotNeg45Deg, 'deg', 'rotNeg45Deg');
  assertUnit(rot45Deg, 'deg', 'rot45Deg');
  assertUnit(gradAngle135Deg, 'deg', 'gradAngle135Deg');
  assertUnit(iconWindupDeg, 'deg', 'iconWindupDeg');
  assertUnit(iconOvershootDeg, 'deg', 'iconOvershootDeg');
  assertUnit(iconFinalDeg, 'deg', 'iconFinalDeg');
  assertUnit(iconBaseDeg, 'deg', 'iconBaseDeg');
  assertUnit(shuttleDurationMs, 'ms', 'shuttleDurationMs');
  assertUnit(shuttleExitDurationMs, 'ms', 'shuttleExitDurationMs');
  assertUnit(iconExitTotalMs, 'ms', 'iconExitTotalMs');
  assertUnit(springDelayMs, 'ms', 'springDelayMs');
  assertUnit(exitTranslationDelayMs, 'ms', 'exitTranslationDelayMs');
  assertUnit(iconLagInDurationMs, 'ms', 'iconLagInDurationMs');
  assertUnit(iconLagOutDurationMs, 'ms', 'iconLagOutDurationMs');
  assertUnit(hoverTransitionMs, 'ms', 'hoverTransitionMs');
  assertUnit(gradientFadeMs, 'ms', 'gradientFadeMs');
  assertUnit(iconScaleEnterMs, 'ms', 'iconScaleEnterMs');
  assertUnit(iconScaleExitMs, 'ms', 'iconScaleExitMs');
  assertUnit(iconScaleDelayInMs, 'ms', 'iconScaleDelayInMs');
  assertUnit(iconScaleDelayOutMs, 'ms', 'iconScaleDelayOutMs');
  assertUnit(iconLagInDistancePx, 'px', 'iconLagInDistancePx');
  assertUnit(iconLagInMicroPx, 'px', 'iconLagInMicroPx');
  assertUnit(iconLagOutDistancePx, 'px', 'iconLagOutDistancePx');
  assertUnit(containerSizePx, 'px', 'containerSizePx');
  assertUnit(hoverBlurPx, 'px', 'hoverBlurPx');
  assertUnit(focusWidthPx, 'px', 'focusWidthPx');
  assertUnit(focusOffsetPx, 'px', 'focusOffsetPx');
}
