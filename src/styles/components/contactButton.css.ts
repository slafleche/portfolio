import { keyframes, style } from '@vanilla-extract/css';
import {
  m,
  measurementHypotenuse,
} from '@/styles/helpers/measurement';
import { colorVars, themeColours } from '../vars';
import { globalBoxShadow } from '../helpers/shadow';
import { focusOutline } from '../helpers/focusOutline';
import { absolutePosition } from '../helpers/positioning';

// vars (note: NO pct0/50/100 imports)
import {
  buttonSizePx,
  iconSizePx,
  shuttleDurationMs,
  shuttleExitDurationMs,
  rotNeg45Deg,
  rot45Deg,
  gradAngle135Deg,
  iconExitTotalMs,
  iconWindupDeg,
  iconOvershootDeg,
  iconFinalDeg,
  iconBaseDeg,
  exitTranslationDelayMs,
  springDelayMs,
  iconLagInDistancePx,
  iconLagInMicroPx,
  iconLagInDurationMs,
  iconLagOutDistancePx,
  iconLagOutDurationMs,
  radiusCirclePct,
  hoverTransitionMs,
  gradientFadeMs,
  iconScaleEnterMs,
  iconScaleExitMs,
  iconScaleDelayInMs,
  iconScaleDelayOutMs,
  containerSizePx,
  t3dInset,
  t3dOffscreen,
  t3dOvershootInSoft,
  t3dPushedOutSoft,
  hoverBlurPx,
  focusWidthPx,
  focusOffsetPx,
} from './contactButton.vars';

/* EASING */
const SNAP = 'cubic-bezier(0.45, 0, 0.2, 1)';
// const SETTLE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const FAST = 'cubic-bezier(0.05, 0.9, 0.1, 1)';
// const motionShadow = '0 2px 6px rgba(0,0,0,0.18)';

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
  transformOrigin: `0 50%`,
  transform: `translateY(50%) rotate(${rotNeg45Deg.css()})`,
  pointerEvents: 'none',
});

/* =========================
   SHUTTLE (translate along rail)
   ========================= */

const enterMotion = keyframes({
  '0%': { transform: t3dOffscreen() },
  '58%': { transform: t3dOvershootInSoft() },
  '100%': { transform: t3dInset() },
});

const shuttleExit = keyframes({
  '0%': { transform: t3dInset() },
  '26%': { transform: t3dPushedOutSoft() },
  '100%': { transform: t3dOffscreen() },
});

export const shuttle = style({
  position: 'absolute',
  left: 0,
  top: 0,
  height: buttonSizePx.css(),
  width: buttonSizePx.css(),

  // offscreen by default (base)
  transform: `${t3dOffscreen()} translateZ(0)`,
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  pointerEvents: 'auto',

  // data-attr driven states (no class thrash)
  selectors: {
    // >>> CRITICAL: explicit steady states so we never fall back to base
    '&[data-phase="hidden"]': {
      animation: 'none',
      transform: `${t3dOffscreen()} translateZ(0)`,
    },
    '&[data-phase="shown"]': {
      animation: 'none',
      transform: `${t3dInset()} translateZ(0)`,
    },

    '&[data-phase="entering"]': {
      animation: `${enterMotion} ${shuttleDurationMs.css()} ${FAST} 0s both`,
    },
    '&[data-phase="exiting"]': {
      // smooth exit with delay (animation owns transform after start)
      animation: `${shuttleExit} ${shuttleExitDurationMs.css()} ${SNAP} ${exitTranslationDelayMs.css()} both`,
    },
    '&[data-resting="true"]': {
      // pin at inset during dwell/delay so there’s no pre-jump
      transform: `${t3dInset()} translateZ(0)`,
    },
  },
});

/* =========================
   SCALE SHELL (rail space; BEFORE payload)
   ========================= */

const stretch = 1.06;
const squash = 1 / stretch;
const stretchExit = stretch;
const squashExit = 1 / stretchExit;

const scaleEnter = keyframes({
  '0%': {
    transform: `translateZ(0) scale3d(${squash}, ${stretch}, 1)`,
  },
  '14%': { transform: 'translateZ(0) scale3d(1,1,1)' },
  '60%': {
    transform: `translateZ(0) scale3d(${stretch}, ${squash}, 1)`,
  },
  '100%': { transform: 'translateZ(0) scale3d(1,1,1)' },
});

const scaleExit = keyframes({
  '0%': { transform: 'translateZ(0) scale3d(1,1,1)' },
  '27%': {
    transform: `translateZ(0) scale3d(${squashExit}, ${stretchExit}, 1)`,
  },
  '65%': { transform: 'translateZ(0) scale3d(1,1,1)' },
  '100%': { transform: 'translateZ(0) scale3d(1,1,1)' },
});

export const scaleShell = style({
  width: '100%',
  height: '100%',
  transform: 'translateZ(0)',
  transformOrigin: `0 50%`, // hinge at left-center (rail origin)
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  selectors: {
    '&[data-phase="entering"]': {
      animation: `${scaleEnter} ${iconScaleEnterMs.css()} ${SNAP} 0s both`,
    },
    '&[data-phase="exiting"]': {
      animation: `${scaleExit} ${iconScaleExitMs.css()} ${SNAP} ${exitTranslationDelayMs.css()} both`,
    },
  },
});

/* =========================
   PAYLOAD (counter-rotate to upright)
   ========================= */

export const payload = style({
  width: '100%',
  height: '100%',
  transform: `rotate(${rot45Deg.css()})`,
  transformOrigin: `50% 50%`,
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
    '&:hover, &:focus-visible': {
      boxShadow: globalBoxShadow({ blur: hoverBlurPx }),
    },
    '&:focus-visible': focusOutline({
      color: themeColours.lights.b
        .mix(themeColours.lights.d, 0.5)
        .css(),
      width: focusWidthPx,
      offset: focusOffsetPx,
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
  backgroundImage: `linear-gradient(${gradAngle135Deg.css()}, ${themeColours.lights.b.css()} 0%, ${themeColours.lights.d.css()} 100%)`,
  opacity: 0,
  transition: `opacity ${gradientFadeMs.css()} ease`,
  zIndex: 0,
  pointerEvents: 'none',
  willChange: 'opacity',
});

export const gradientVisible = style({
  selectors: {
    [`${button}:hover &`]: { opacity: 1 },
    [`${button}:focus-visible &`]: { opacity: 1 },
  },
});

/* =========================
   ICON STACK
   ========================= */

const iconLagIn = keyframes({
  '0%': {
    transform: `translate3d(${iconLagInDistancePx.negation().css()}, ${iconLagInDistancePx.css()}, 0)`,
  },
  '72%': {
    transform: `translate3d(${iconLagInMicroPx.css()}, ${iconLagInMicroPx.negation().css()}, 0)`,
  },
  '100%': { transform: 'translate3d(0,0,0)' },
});

const iconLagOut = keyframes({
  '0%': { transform: 'translate3d(0,0,0)' },
  '30%': {
    transform: `translate3d(${iconLagOutDistancePx.css()}, ${iconLagOutDistancePx.negation().css()}, 0)`,
  },
  '50%': {
    transform: `translate3d(${iconLagOutDistancePx.css()}, ${iconLagOutDistancePx.negation().css()}, 0)`,
  },
  '100%': { transform: 'translate3d(0,0,0)' },
});

export const iconWrap = style({
  width: iconSizePx.css(),
  height: iconSizePx.css(),
  display: 'grid',
  placeItems: 'center',
  overflow: 'visible',
  transform: 'translate3d(0,0,0)',
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
    '&[data-phase="entering"]': {
      animation: `${iconLagIn} ${iconLagInDurationMs.css()} ${springDelayMs.css()} both`,
    },
    '&[data-phase="exiting"]': {
      animation: `${iconLagOut} ${iconLagOutDurationMs.css()} ${exitTranslationDelayMs.add(springDelayMs).css()} both`,
    },
  },
});

/* icon squash/stretch in rail axis via rotate-sandwich */
const iconStretch = 1.05;
const iconSquash = 1 / iconStretch;

const iconScaleEnter = keyframes({
  '0%': {
    transform: `translateZ(0) rotate(${rotNeg45Deg.css()}) scale3d(${iconSquash}, ${iconStretch}, 1) rotate(${rot45Deg.css()})`,
  },
  '60%': {
    transform: `translateZ(0) rotate(${rotNeg45Deg.css()}) scale3d(${iconStretch}, ${iconSquash}, 1) rotate(${rot45Deg.css()})`,
  },
  '100%': {
    transform:
      'translateZ(0) rotate(0deg) scale3d(1,1,1) rotate(0deg)',
  },
});

const iconScaleExit = keyframes({
  '0%': {
    transform:
      'translateZ(0) rotate(0deg) scale3d(1,1,1) rotate(0deg)',
  },
  '27%': {
    transform: `translateZ(0) rotate(${rotNeg45Deg.css()}) scale3d(${iconSquash}, ${iconStretch}, 1) rotate(${rot45Deg.css()})`,
  },
  '65%': {
    transform:
      'translateZ(0) rotate(0deg) scale3d(1,1,1) rotate(0deg)',
  },
  '100%': {
    transform:
      'translateZ(0) rotate(0deg) scale3d(1,1,1) rotate(0deg)',
  },
});

export const iconScale = style({
  display: 'grid',
  placeItems: 'center',
  width: '100%',
  height: '100%',
  transform: 'translateZ(0)',
  transformOrigin: `100% 50%`, // “front” edge
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  selectors: {
    '&[data-phase="entering"]': {
      animation: `${iconScaleEnter} ${iconScaleEnterMs.css()} ${iconScaleDelayInMs.css()} both`,
    },
    '&[data-phase="exiting"]': {
      animation: `${iconScaleExit} ${iconScaleExitMs.css()} ${iconScaleDelayOutMs.css()} both`,
    },
  },
});

/* glyph rotation */
const addBaseDeg = (deg: ReturnType<typeof m>) =>
  deg.add(iconBaseDeg);

const iconRotateExit = keyframes({
  '0%': { transform: `rotate(${addBaseDeg(m(0, 'deg')).css()})` },
  '22%': { transform: `rotate(${addBaseDeg(iconWindupDeg).css()})` },
  '45%': {
    transform: `rotate(calc(${iconBaseDeg.add(iconFinalDeg).css()} + ${iconOvershootDeg.css()}))`,
  },
  '100%': { transform: `rotate(${addBaseDeg(iconFinalDeg).css()})` },
});

export const iconGlyph = style({
  display: 'block',
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: '100%',
  transformBox: 'fill-box',
  transformOrigin: `50% 50%`,
  transform: `translateZ(0) rotate(${iconBaseDeg.css()})`,
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  selectors: {
    '&[data-phase="exiting"]': {
      animation: `${iconRotateExit} ${iconExitTotalMs.css()} both`,
    },
    [`${button}:hover &`]: { color: colorVars.white.css() },
    [`${button}:focus-visible &`]: { color: colorVars.white.css() },
  },
});
