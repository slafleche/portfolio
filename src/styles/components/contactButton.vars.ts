import { m, assertUnit } from '@/styles/helpers/measurement';

/* ===== Base measurements ===== */
export const offsetPx = m(26, 'px');
export const buttonSizePx = m(66, 'px');
export const iconSizePx = m(36, 'px');

/* ===== Timings ===== */
export const shuttleDurationMs = m(700, 'ms');
export const shuttleExitDurationMs = shuttleDurationMs;

export const entryOvershootPx = m(14, 'px');
export const exitPushPx = m(22, 'px');

export const rotNeg45Deg = m(-45, 'deg');
export const rot45Deg = m(45, 'deg');
export const gradAngle135Deg = m(135, 'deg');

/* Icon rotation timing (make it readable) */
export const iconExitTotalMs = m(700, 'ms'); // match shuttle for clarity
export const iconWindupDeg = m(20, 'deg');
export const iconOvershootDeg = m(-12, 'deg'); // knob
export const iconFinalDeg = m(-180, 'deg');
export const iconBaseDeg = m(0, 'deg');

/* ===== Misc timing refs ===== */
export const springDelayMs = m(80, 'ms');
export const exitTranslationDelayMs = m(0, 'ms');

export const iconLagInDistancePx = m(8, 'px');
export const iconLagInMicroPx = m(0.8, 'px');
export const iconLagInDurationMs = m(160, 'ms');
export const iconLagOutDistancePx = m(3, 'px');
export const iconLagOutDurationMs = shuttleExitDurationMs;

export const radiusCirclePct = m(50, '%');
export const hoverTransitionMs = m(220, 'ms');
export const gradientFadeMs = m(200, 'ms');

/* ===== Button rotate-sandwich scale knobs (volume preserving) ===== */
/* Enter: stretch along travel; kEnter on X, 1/kEnter on Y */
export const kEnter = 1.5;

/* Exit: anticipation slight stretch; hold = squash */
export const kAntic = 1.08;
export const kSquash = 0.78; // < 1 means squash in X; Y auto = 1/kSquash

/* Derived (do NOT hardcode): */
export const kEnterY = 1 / kEnter;
export const kAnticY = 1 / kAntic;
export const kSquashY = 1 / kSquash;

/* Durations for the button scaling animations */
export const iconScaleEnterMs = m(180, 'ms');
export const iconScaleExitMs = m(420, 'ms'); // longer to read the hold
export const iconScaleDelayInMs = springDelayMs.add(m(40, 'ms'));
export const iconScaleDelayOutMs = springDelayMs.add(m(40, 'ms'));

/* Exit phase percentages (knobs) */
export const exitAnticPct = m(12, '%');   // anticipate first
export const exitHoldPct = m(25, '%');    // visible hold window
export const exitSpinHitDeltaPct = m(20, '%'); // antic + 20% => spin reach final+overshoot

/* ===== Legacy refs (not core) ===== */
export const scaleEnterDurationMs = m(260, 'ms');
export const scaleExitDurationMs = m(420, 'ms');
export const scaleDelayEnterMs = m(0, 'ms');
export const scaleDelayExitMs = exitTranslationDelayMs;

export const stretch = 1.06;
export const squash = 1 / stretch;
export const stretchExit = stretch;
export const squashExit = 1 / stretchExit;

/* ===== Geometry ===== */
export const containerSizePx = buttonSizePx.multiply(3.6);
export const diagonalOffsetPx = offsetPx.multiply(Math.SQRT2);

/* ===== Transform strings ===== */
const ENTRY_SOFT_FACTOR = 0.7;
const EXIT_SOFT_FACTOR = 0.9;

export const t3dInset = () =>
  `translate3d(${diagonalOffsetPx.css()},0,0)`;

export const t3dOffscreen = () =>
  `translate3d(${buttonSizePx.multiply(-2).add(diagonalOffsetPx.negation().subtract(2)).css()},0,0)`;

export const t3dOvershootInSoft = () =>
  `translate3d(calc(${diagonalOffsetPx.css()} + ${entryOvershootPx.multiply(ENTRY_SOFT_FACTOR).css()}),0,0)`;

export const t3dPushedOutSoft = () =>
  `translate3d(calc(${diagonalOffsetPx.css()} + ${exitPushPx.multiply(EXIT_SOFT_FACTOR).css()}),0,0)`;

/* ===== A11y / hover ===== */
export const hoverBlurPx = m(10, 'px');
export const focusWidthPx = m(2, 'px');
export const focusOffsetPx = m(2, 'px');

/* ===== Dev unit checks ===== */
if (process.env.NODE_ENV !== 'production') {
  assertUnit(offsetPx, 'px', 'offsetPx');
  assertUnit(buttonSizePx, 'px', 'buttonSizePx');
  assertUnit(iconSizePx, 'px', 'iconSizePx');
  assertUnit(entryOvershootPx, 'px', 'entryOvershootPx');
  assertUnit(exitPushPx, 'px', 'exitPushPx');
  assertUnit(diagonalOffsetPx, 'px', 'diagonalOffsetPx');
  assertUnit(iconLagInDistancePx, 'px', 'iconLagInDistancePx');
  assertUnit(iconLagInMicroPx, 'px', 'iconLagInMicroPx');
  assertUnit(iconLagOutDistancePx, 'px', 'iconLagOutDistancePx');
  assertUnit(containerSizePx, 'px', 'containerSizePx');
  assertUnit(hoverBlurPx, 'px', 'hoverBlurPx');
  assertUnit(focusWidthPx, 'px', 'focusWidthPx');
  assertUnit(focusOffsetPx, 'px', 'focusOffsetPx');

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

  assertUnit(radiusCirclePct, '%', 'radiusCirclePct');
  assertUnit(exitHoldPct, '%', 'exitHoldPct');
  assertUnit(exitAnticPct, '%', 'exitAnticPct');
  assertUnit(exitSpinHitDeltaPct, '%', 'exitSpinHitDeltaPct');
}
