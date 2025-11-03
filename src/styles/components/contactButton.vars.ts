import { m, assertUnit } from '../measurement';

/* ---------- SPIN (exit) ---------- */
export const spinAnticDeg = m(10, 'deg'); // wrong-direction pre-rotation
export const spinAnticHoldPct = m(20, '%'); // hold at antic pose
export const spinRevs = 0.5; // total revs to final (0.5=180°, 1.5=540°)
export const spinAccelPct = m(22, '%'); // antic→final(+overshoot) duration
export const spinOvershootDeg = 20; // degrees past final before settle
export const spinOvershootHoldPct = m(10, '%'); // hold at overshoot (makes it visible)
export const spinHoldPct = m(12, '%'); // hold straight at final before release
export const iconExitTotalMs = m(700, 'ms'); // total spin timeline (increase to slow the spin)

/* ---------- SQUASH (exit) ---------- */
/* Delay squash so it starts AFTER the spin is effectively complete:
   spinAnticHold(10) + spinAccel(22) + overshootHold(6) + spinHold(12) = ~50%
   SQUASH_START = exitAnticPct(12%) + squashStartDeltaPct(50%) = 62% overall
*/
export const kSquash = 0.78; // X during wall-press (Y = 1/X); volume preserved
export const squashStartDeltaPct = m(50, '%'); // delay from exitAnticPct to squash start (less overlap)

/* Stretch used in release (squash→stretch→neutral). Keep louder for now, dial back later. */
export const kAntic = 1.08;

/* ---------- ENTER ---------- */
export const kEnter = 1.5; // enter stretch (X); Y = 1/X

/* Derived scales (do not edit directly) */
export const kSquashY = 1 / kSquash;
export const kAnticY = 1 / kAntic;
export const kEnterY = 1 / kEnter;

/* ---------- Core geometry/timings ---------- */
export const offsetPx = m(26, 'px');
export const buttonSizePx = m(66, 'px');
export const iconSizePx = m(36, 'px');

export const shuttleDurationMs = m(700, 'ms');
export const shuttleExitDurationMs = shuttleDurationMs;

export const entryOvershootPx = m(14, 'px');
export const exitPushPx = m(22, 'px');

export const rotNeg45Deg = m(-45, 'deg');
export const rot45Deg = m(45, 'deg');
export const gradAngle135Deg = m(135, 'deg');

/* Sequencing anchors */
export const exitAnticPct = m(12, '%'); // when spin antic pose is reached
export const exitHoldPct = m(25, '%'); // button wall-press HOLD window (readability)

/* Button scale durations (exit/enter) */
export const iconScaleEnterMs = m(180, 'ms'); // enter squash/stretch
export const iconScaleExitMs = m(420, 'ms'); // exit squash→stretch→neutral
export const springDelayMs = m(80, 'ms'); // general micro spring delay

/* ---------- Shuttle delay (keep at wall until spin is done) ----------
   Rule of thumb:
   exitTranslationDelayMs ≈ iconExitTotalMs * (exitAnticPct + spinAnticHoldPct + spinAccelPct + spinOvershootHoldPct + spinHoldPct)
   With defaults: 12% + 10% + 22% + 6% + 12% = 62% → 0.62 * 700ms ≈ 434ms (round to 440ms).
   If you change iconExitTotalMs, recompute this delay.
*/
export const exitTranslationDelayMs = m(440, 'ms'); // delay before shuttle moves on exit (syncs with spin end)

/* ---------- Lag (enter only; exit lag disabled so spin reads clean) ---------- */
export const iconLagInDistancePx = m(8, 'px');
export const iconLagInMicroPx = m(0.8, 'px');
export const iconLagInDurationMs = m(160, 'ms');
export const iconLagOutDistancePx = m(3, 'px');
export const iconLagOutDurationMs = shuttleExitDurationMs;

/* ---------- Visual polish ---------- */
export const radiusCirclePct = m(50, '%');
export const hoverTransitionMs = m(220, 'ms');
export const gradientFadeMs = m(200, 'ms');

/* ---------- Derived geometry ---------- */
export const containerSizePx = buttonSizePx.multiply(3.6);
export const diagonalOffsetPx = offsetPx.multiply(Math.SQRT2);

/* ---------- Transform strings ---------- */
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

/* ---------- A11y / focus ---------- */
export const hoverBlurPx = m(10, 'px');
export const focusWidthPx = m(2, 'px');
export const focusOffsetPx = m(2, 'px');

/* ---------- Dev unit checks ---------- */
if (process.env.NODE_ENV !== 'production') {
  // px
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

  // deg
  assertUnit(rotNeg45Deg, 'deg', 'rotNeg45Deg');
  assertUnit(rot45Deg, 'deg', 'rot45Deg');
  assertUnit(gradAngle135Deg, 'deg', 'gradAngle135Deg');
  assertUnit(spinAnticDeg, 'deg', 'spinAnticDeg');

  // ms
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

  // %
  assertUnit(radiusCirclePct, '%', 'radiusCirclePct');
  assertUnit(exitAnticPct, '%', 'exitAnticPct');
  assertUnit(exitHoldPct, '%', 'exitHoldPct');
  assertUnit(spinAnticHoldPct, '%', 'spinAnticHoldPct');
  assertUnit(spinAccelPct, '%', 'spinAccelPct');
  assertUnit(spinOvershootHoldPct, '%', 'spinOvershootHoldPct');
  assertUnit(spinHoldPct, '%', 'spinHoldPct');
  assertUnit(squashStartDeltaPct, '%', 'squashStartDeltaPct');
}
