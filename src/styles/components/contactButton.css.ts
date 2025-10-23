import { keyframes, style } from '@vanilla-extract/css';
import {
  m,
  measurementHypotenuse,
} from '@/styles/helpers/measurement';
import { colorVars, themeColours } from '../vars';
import { globalBoxShadow } from '../helpers/shadow';
import { focusOutline } from '../helpers/focusOutline';
import { absolutePosition } from '../helpers/positioning';

/* =========================
   KNOBS
   ========================= */

const offsetPx = m(26);
const buttonSizePx = m(66);
const iconSizePx = m(36);

const SNAP = 'cubic-bezier(0.45, 0, 0.2, 1)';
const SETTLE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const FAST = 'cubic-bezier(0.05, 0.9, 0.1, 1)';

const shuttleDurationMs = m(520, 'ms');
const shuttleExitDurationMs = shuttleDurationMs;

const entryOvershootPx = m(14);
const exitPushPx = m(5);

const pct0 = m(0, '%');
const pct50 = m(50, '%');
const pct100 = m(100, '%');

const rotNeg45Deg = m(-45, 'deg');
const rot45Deg = m(45, 'deg');
const rot0Deg = m(0, 'deg');
const gradAngle135Deg = m(135, 'deg');

const iconExitTotalMs = m(500, 'ms');
const iconWindupDeg = m(20, 'deg');
const iconOvershootDeg = m(-20, 'deg');
const iconFinalDeg = m(-180, 'deg');
const iconBaseDeg = m(0, 'deg');

const shuttleStartRatio = 1; // 0–1
const shuttleStartOffsetMs = m(0, 'ms');
const exitTranslationDelayMs = iconExitTotalMs
  .multiply(shuttleStartRatio)
  .add(shuttleStartOffsetMs);

const springDelayMs = m(100, 'ms');
const iconLagInDistancePx = m(8);
const iconLagInMicroPx = m(1.5);
const iconLagInDurationMs = m(160, 'ms');
const iconLagOutDistancePx = m(3);
const iconLagOutDurationMs = shuttleExitDurationMs;

const radiusCirclePct = m(50, '%');
const hoverTransitionMs = m(220, 'ms');
const gradientFadeMs = m(200, 'ms');

const motionShadow = '0 2px 6px rgba(0,0,0,0.18)';

/* Squash & Stretch (volume-preserving in rail space) */
const scaleEnterDurationMs = m(260, 'ms');
const scaleExitDurationMs = m(420, 'ms');
const scaleDelayEnterMs = m(0, 'ms');
const scaleDelayExitMs = exitTranslationDelayMs.subtract(100);
const stretch = 1.06; // along rail-X
const squash = 1 / stretch; // inverse on rail-Y
const stretchExit = stretch;
const squashExit = 1 / stretchExit;

/* =========================
   DERIVED (no .css() yet)
   ========================= */

const containerSizePx = buttonSizePx.multiply(3.6);
const diagonalOffsetPx = offsetPx.multiply(Math.SQRT2);

const t3dInset = () => `translate3d(${diagonalOffsetPx.css()},0,0)`;
const t3dOffscreen = () =>
  `translate3d(calc(-100% - ${diagonalOffsetPx.css()}),0,0)`;
const t3dOvershootIn = () =>
  `translate3d(calc(${diagonalOffsetPx.css()} + ${entryOvershootPx.css()}),0,0)`;
const t3dPushedOut = () =>
  `translate3d(calc(${diagonalOffsetPx.css()} + ${exitPushPx.css()}),0,0)`;

/* =========================
   STRUCTURE
   ========================= */

export const root = style({
  position: 'fixed',
  left: 0,
  bottom: 0,
  width: containerSizePx.css(),
  height: containerSizePx.css(),
  zIndex: 30,
  overflow: 'hidden',
  pointerEvents: 'auto',
});

export const rail = style({
  ...absolutePosition.bottomLeft(),
  width: measurementHypotenuse(containerSizePx).css(),
  height: buttonSizePx.css(),
  transformOrigin: `0 ${pct50.css()}`,
  transform: `translateY(${pct50.css()}) rotate(${rotNeg45Deg.css()})`,
  pointerEvents: 'none',
});

/* =========================
   SHUTTLE (translate along rail)
   ========================= */

const enterMotion = keyframes({
  '0%': { transform: t3dOffscreen(), animationTimingFunction: FAST },
  '68%': {
    transform: t3dOvershootIn(),
    animationTimingFunction: SETTLE,
  },
  '100%': { transform: t3dInset() },
});

const shuttleExit = keyframes({
  '0%': { transform: t3dInset(), animationTimingFunction: SNAP },
  '30%': {
    transform: t3dPushedOut(),
    animationTimingFunction: 'linear',
  },
  '50%': { transform: t3dPushedOut(), animationTimingFunction: SNAP },
  '100%': { transform: t3dOffscreen() },
});

export const shuttle = style({
  position: 'absolute',
  left: 0,
  top: 0,
  height: buttonSizePx.css(),
  width: buttonSizePx.css(),
  transform: `${t3dOffscreen()} translateZ(0)`,
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  pointerEvents: 'auto',
});

export const visible = style({
  animation: `${enterMotion} ${shuttleDurationMs.css()} both`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: t3dInset(),
    },
  },
});

export const leaving = style({
  transform: t3dInset(),
  animation: `${shuttleExit} ${shuttleExitDurationMs.css()} ${SNAP} ${exitTranslationDelayMs.css()} both`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: t3dOffscreen(),
    },
  },
});

/* =========================
   SCALE SHELL (in rail space; BEFORE payload)
   ========================= */

// ENTRY: single squash → stretch → neutral
const scaleEnter = keyframes({
  '0%': {
    transform: `translateZ(0) scale3d(${squash}, ${stretch}, 1)`,
  }, // anticipation: squat
  '18%': {
    transform: 'translateZ(0) scale3d(1, 1, 1)',
    animationTimingFunction: SNAP,
  }, // release
  '70%': {
    transform: `translateZ(0) scale3d(${stretch}, ${squash}, 1)`,
  }, // stretch during peak velocity
  '100%': { transform: 'translateZ(0) scale3d(1, 1, 1)' }, // settle neutral
});

// EXIT: single squash (anticipation) → stretch (push) → neutral
const scaleExit = keyframes({
  '0%': { transform: 'translateZ(0) scale3d(1, 1, 1)' },
  '20%': {
    transform: `translateZ(0) scale3d(${squashExit}, ${stretchExit}, 1)`,
    animationTimingFunction: SNAP,
  }, // anticipation
  '55%': {
    transform: `translateZ(0) scale3d(${stretchExit}, ${squashExit}, 1)`,
  }, // stretch during push into corner
  '100%': { transform: 'translateZ(0) scale3d(1, 1, 1)' }, // back to neutral
});

export const scaleShell = style({
  width: '100%',
  height: '100%',
  transform: 'translateZ(0)',
  transformOrigin: `${m(0, '%').css()} ${m(50, '%').css()}`, // hinge at left-center (rail origin)
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  selectors: {
    [`${visible} &`]: {
      animation: `${scaleEnter} ${scaleEnterDurationMs.css()} ${scaleDelayEnterMs.css()} both`,
    },
    [`${leaving} &`]: {
      animation: `${scaleExit} ${scaleExitDurationMs.css()} ${scaleDelayExitMs.css()} both`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': { animation: 'none' },
  },
});

/* =========================
   PAYLOAD (counter-rotate back to upright)
   ========================= */

export const payload = style({
  width: '100%',
  height: '100%',
  transform: `rotate(${rot45Deg.css()})`,
  transformOrigin: `${pct50.css()} ${pct50.css()}`,
  position: 'relative',
});

/* =========================
   BUTTON
   ========================= */

export const button = style({
  position: 'absolute',
  width: buttonSizePx.css(),
  height: buttonSizePx.css(),
  left: 0,
  bottom: 0,
  borderRadius: radiusCirclePct.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colorVars.white.alpha(0.95).css(),
  color: colorVars.svgColor.css(),
  textDecoration: 'none',
  boxShadow: globalBoxShadow(),
  pointerEvents: 'auto',
  transition: `box-shadow ${hoverTransitionMs.css()} ease`,
  willChange: 'transform',
  selectors: {
    [`${visible} &`]: { boxShadow: motionShadow, transition: 'none' },
    [`${leaving} &`]: {
      pointerEvents: 'none',
      boxShadow: motionShadow,
      transition: 'none',
    },
    '&:hover, &:focus-visible': {
      boxShadow: globalBoxShadow({ blur: m(12) }),
    },
    '&:focus-visible': focusOutline({
      color: themeColours.lights.b
        .mix(themeColours.lights.d, 0.5)
        .css(),
      width: m(3),
      offset: m(4),
    }),
  },
});

/* =========================
   GRADIENT
   ========================= */

export const gradient = style({
  position: 'absolute',
  inset: 0,
  borderRadius: radiusCirclePct.css(),
  backgroundImage: `linear-gradient(${gradAngle135Deg.css()}, ${themeColours.lights.b.css()} ${pct0.css()}, ${themeColours.lights.d.css()} ${pct100.css()})`,
  opacity: 0,
  transition: `opacity ${gradientFadeMs.css()} ease`,
  zIndex: 0,
  pointerEvents: 'none',
  willChange: 'opacity',
  selectors: { [`${leaving} &`]: { opacity: 0 } },
});

export const gradientVisible = style({
  selectors: {
    [`${button}:hover &`]: { opacity: 1 },
    [`${button}:focus-visible &`]: { opacity: 1 },
  },
});

/* =========================
   ICON (barrel roll + spring)
   ========================= */

export const iconWrap = style({
  width: iconSizePx.css(),
  height: iconSizePx.css(),
  display: 'grid',
  placeItems: 'center',
  overflow: 'visible',
  transform: 'translate3d(0,0,0)',
});

const addBaseDeg = (deg: ReturnType<typeof m>) =>
  deg.add(iconBaseDeg);

const iconRotateExit = keyframes({
  '0%': { transform: `rotate(${addBaseDeg(rot0Deg).css()})` },
  '20%': { transform: `rotate(${addBaseDeg(iconWindupDeg).css()})` },
  '40%': {
    transform: `rotate(${addBaseDeg(iconWindupDeg).css()})`,
    animationTimingFunction: SNAP,
  },
  '58%': {
    transform: `rotate(calc(${iconBaseDeg.add(iconFinalDeg).css()} + ${iconOvershootDeg.css()}))`,
    animationTimingFunction: 'cubic-bezier(0.18,0.92,0.12,1)',
  },
  '78%': {
    transform: `rotate(calc(${iconBaseDeg.add(iconFinalDeg).css()} + ${iconOvershootDeg.css()}))`,
    animationTimingFunction: SETTLE,
  },
  '100%': { transform: `rotate(${addBaseDeg(iconFinalDeg).css()})` },
});

const iconLagIn = keyframes({
  '0%': {
    transform: `translate3d(${iconLagInDistancePx.negation().css()}, ${iconLagInDistancePx.css()}, 0)`,
    animationTimingFunction: SNAP,
  },
  '72%': {
    transform: `translate3d(${iconLagInMicroPx.css()}, ${iconLagInMicroPx.negation().css()}, 0)`,
    animationTimingFunction: SETTLE,
  },
  '100%': { transform: 'translate3d(0,0,0)' },
});

const iconLagOut = keyframes({
  '0%': {
    transform: 'translate3d(0,0,0)',
    animationTimingFunction: SNAP,
  },
  '30%': {
    transform: `translate3d(${iconLagOutDistancePx.css()}, ${iconLagOutDistancePx.negation().css()}, 0)`,
    animationTimingFunction: 'linear',
  },
  '50%': {
    transform: `translate3d(${iconLagOutDistancePx.css()}, ${iconLagOutDistancePx.negation().css()}, 0)`,
    animationTimingFunction: SETTLE,
  },
  '100%': { transform: 'translate3d(0,0,0)' },
});

export const iconShell = style({
  display: 'grid',
  placeItems: 'center',
  width: '100%',
  height: '100%',
  transform: 'translateZ(0)',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  selectors: {
    [`${visible} &`]: {
      animation: `${iconLagIn} ${iconLagInDurationMs.css()} ${springDelayMs.css()} both`,
    },
    [`${leaving} &`]: {
      animation: `${iconLagOut} ${iconLagOutDurationMs.css()} ${exitTranslationDelayMs.add(springDelayMs).css()} both`,
    },
  },
});

export const iconGlyph = style({
  display: 'block',
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: '100%',
  transformBox: 'fill-box',
  transformOrigin: `${pct50.css()} ${pct50.css()}`,
  transform: `translateZ(0) rotate(${iconBaseDeg.css()})`,
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  selectors: {
    [`${button}:hover &`]: { color: colorVars.white.css() },
    [`${button}:focus-visible &`]: { color: colorVars.white.css() },
    [`${leaving} &`]: {
      animation: `${iconRotateExit} ${iconExitTotalMs.css()} both`,
    },
  },
});
