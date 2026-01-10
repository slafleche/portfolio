import { keyframes, style } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';

import {
  colors,
  colorVars,
  themeColours,
} from '../../tokens/global.tokens';
import borders from '../helpers/borders.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { outlines } from '../helpers/outlines.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { measureHypotenuse } from '../helpers/utils.helper';
import {
  buttonRadius,
  buttonSizePx,
  containerSizePx,
  exitAnticPct,
  exitHoldPct,
  exitTranslationDelayMs,
  focusOffsetPx,
  focusWidthPx,
  gradAngleDiagDeg,
  gradientFadeMs,
  hoverBlurPx,
  hoverTransitionMs,
  iconExitTotalMs,
  iconLagInDistancePx,
  iconLagInDurationMs,
  iconLagInMicroPx,
  iconScaleEnterMs,
  iconScaleExitMs,
  iconSizePx,
  kAntic,
  kAnticY,
  kEnter,
  kEnterY,
  kSquash,
  kSquashY,
  railCounterRotationDeg,
  railRotationDeg,
  shuttleDurationMs,
  shuttleExitDurationMs,
  spinAccelPct,
  /* SPIN + SQUASH knobs */
  spinAnticDeg,
  spinAnticHoldPct,
  spinHoldPct,
  spinOvershootDeg,
  spinOvershootHoldPct,
  spinRevs,
  springDelayMs,
  squashStartDeltaPct,
  t3dInset,
  t3dOffscreen,
  t3dOvershootInSoft,
  t3dPushedOutSoft,
} from './contactButton.vars';

/* EASING */
const SNAP = 'cubic-bezier(0.45, 0, 0.2, 1)';
const SETTLE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const FAST = 'cubic-bezier(0.05, 0.9, 0.1, 1)';
const ANTIC = 'cubic-bezier(0.3, 0.9, 0.2, 1)';

/* ROOT + RAIL */
export const root = style({
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: containerSizePx.css(),
  height: containerSizePx.css(),
  zIndex: 30,
  overflow: 'hidden',
  pointerEvents: 'none',
});

export const rail = style({
  ...absolutePosition.bottomRight(),
  width: measureHypotenuse(containerSizePx).css(),
  height: buttonSizePx.css(),
  transformOrigin: `100% 50%`,
  transform: `translateY(50%) rotate(${railRotationDeg.css()})`,
  pointerEvents: 'none',
});

/* SHUTTLE motion */
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
  right: 0,
  top: 0,
  height: buttonSizePx.css(),
  width: buttonSizePx.css(),
  transform: `${t3dOffscreen()} translateZ(0)`,
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  pointerEvents: 'auto',
  selectors: {
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
      animation: `${shuttleExit} ${shuttleExitDurationMs.css()} ${SNAP} ${exitTranslationDelayMs.css()} both`,
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        "&[data-phase='exiting']": {
          animation: `${shuttleExit} 0s ${SNAP} 0s both`,
        },
        "&[data-phase='entering']": {
          animation: `${enterMotion} 0s ${FAST} 0s both`,
        },
      },
    },
  },
});

/* PAYLOAD — keep axes clean */
export const payload = style({
  width: '100%',
  height: '100%',
  transform: `rotate(${railCounterRotationDeg.css()})`,
  transformOrigin: `50% 50%`,
  position: 'relative',
});

/* BUTTON — rotate-sandwich, volume preserved */
const buttonScaleEnter = keyframes({
  '0%': {
    transform: `translateZ(0) rotate(${railRotationDeg.css()}) scale3d(${kEnter}, ${kEnterY}, 1) rotate(${railCounterRotationDeg.css()})`,
  },
  '58%': {
    transform: `translateZ(0) rotate(${railRotationDeg.css()}) scale3d(${kEnter}, ${kEnterY}, 1) rotate(${railCounterRotationDeg.css()})`,
  },
  '100%': {
    transform: `translateZ(0) rotate(${railRotationDeg.css()}) scale3d(1,1,1) rotate(${railCounterRotationDeg.css()})`,
  },
});

/* Exit: anticipate stretch → squash hold → release (squash→stretch→neutral) */
const HOLD_END = exitAnticPct.add(exitHoldPct).css();
const SQUASH_START = exitAnticPct.add(squashStartDeltaPct).css();

const buttonScaleExit = keyframes({
  '0%': {
    transform: `translateZ(0) rotate(${railRotationDeg.css()}) scale3d(1,1,1) rotate(${railCounterRotationDeg.css()})`,
  },
  [exitAnticPct.css()]: {
    transform: `translateZ(0) rotate(${railRotationDeg.css()}) scale3d(${kAntic}, ${kAnticY}, 1) rotate(${railCounterRotationDeg.css()})`,
  },
  [SQUASH_START]: {
    transform: `translateZ(0) rotate(${railRotationDeg.css()}) scale3d(${kSquash}, ${kSquashY}, 1) rotate(${railCounterRotationDeg.css()})`,
  },
  [HOLD_END]: {
    transform: `translateZ(0) rotate(${railRotationDeg.css()}) scale3d(${kSquash}, ${kSquashY}, 1) rotate(${railCounterRotationDeg.css()})`,
  },
  '80%': {
    transform: `translateZ(0) rotate(${railRotationDeg.css()}) scale3d(${kAntic}, ${kAnticY}, 1) rotate(${railCounterRotationDeg.css()})`,
  },
  '100%': {
    transform: `translateZ(0) rotate(${railRotationDeg.css()}) scale3d(1,1,1) rotate(${railCounterRotationDeg.css()})`,
  },
});

export const button = style({
  position: 'absolute',
  width: buttonSizePx.css(),
  height: buttonSizePx.css(),
  right: 0,
  bottom: 0,
  borderRadius: buttonRadius.css(),
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colorVars.white.alpha(0.95).css(),
  color: colorVars.svgColor.css(),
  textDecoration: 'none',
  ...boxShadow(),
  pointerEvents: 'auto',
  transition: `box-shadow ${hoverTransitionMs.css()} ease`,
  transformOrigin: `0 50%`,
  willChange: 'transform',
  ...borders({
    color: colors.white,
    width: m(2),
  }),
  selectors: {
    '&:hover, &:focus-visible': {
      color: colorVars.white.css(),
      ...boxShadow({ blur: hoverBlurPx }),
    },
    '&:focus-visible': {
      color: colorVars.white.css(),
      ...outlines({
        width: focusWidthPx,
        offset: focusOffsetPx,
      }),
    },
    '&[data-phase="entering"]': {
      animation: `${buttonScaleEnter} ${iconScaleEnterMs.css()} ${SETTLE} 0s both`,
    },
    '&[data-phase="exiting"]': {
      pointerEvents: 'none',
      animation: `${buttonScaleExit} ${iconScaleExitMs.css()} ${SETTLE} ${exitTranslationDelayMs.css()} both`,
    },
    '&[data-phase="shown"]': { pointerEvents: 'auto' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
      selectors: {
        '&[data-phase="entering"]': {
          animation: `${buttonScaleEnter} 0s ${SETTLE} 0s both`,
        },
        "&[data-phase='exiting']": {
          animation: `${buttonScaleExit} 0s ${SETTLE} 0s both`,
        },
      },
    },
  },
});

const buttonGradient = buildLinear({
  angle: gradAngleDiagDeg,
  stops: [
    { color: themeColours.brand, at: mPercent(0) },
    { color: themeColours.secondary, at: mPercent(100) },
  ],
});

/* GRADIENT */
export const gradient = style({
  position: 'absolute',
  inset: 0,
  borderRadius: buttonRadius.css(),
  ...gradientAsBgImg(buttonGradient),
  opacity: 0,
  transition: `opacity ${gradientFadeMs.css()} ease`,
  zIndex: 0,
  pointerEvents: 'none',
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
});
export const gradientVisible = style({
  selectors: {
    [`${button}:hover &`]: { opacity: 1 },
    [`${button}:focus-visible &`]: { opacity: 1 },
  },
});

const iconLagIn = keyframes({
  '0%': {
    transform: `translate3d(${iconLagInDistancePx.css()}, ${iconLagInDistancePx.css()}, 0)`,
  },
  '72%': {
    transform: `translate3d(${iconLagInMicroPx.negation().css()}, ${iconLagInMicroPx.negation().css()}, 0)`,
  },
  '100%': { transform: 'translate3d(0,0,0)' },
});

const addDeg = (n: number) => m(n, 'deg').css();
const A = exitAnticPct.css();
const A_HOLD_END = exitAnticPct.add(spinAnticHoldPct).css();
const SPIN_END = exitAnticPct
  .add(spinAnticHoldPct)
  .add(spinAccelPct)
  .css();
const OS_HOLD_END = exitAnticPct
  .add(spinAnticHoldPct)
  .add(spinAccelPct)
  .add(spinOvershootHoldPct)
  .css();
const SPIN_HOLD_END = exitAnticPct
  .add(spinAnticHoldPct)
  .add(spinAccelPct)
  .add(spinOvershootHoldPct)
  .add(spinHoldPct)
  .css();

const FINAL_SPIN_DEG = addDeg(-(spinRevs * 360));
const FINAL_SPIN_OVERSHOOT_DEG = addDeg(
  -(spinRevs * 360 + spinOvershootDeg),
);

/* --- ICON: rotation + subtle scale (icon only) --- */
const ICON_SCALE_ANTIC = 0.95;
const ICON_SCALE_OS = 1.1;

const iconRotateExit = keyframes({
  '0%': {
    animationTimingFunction: ANTIC,
    transform: `rotate(${addDeg(0)}) scale(1)`,
  },
  [A]: {
    animationTimingFunction: 'linear', // antic reaches spinAnticDeg
    transform: `rotate(${spinAnticDeg.css()}) scale(${ICON_SCALE_ANTIC})`,
  },
  [A_HOLD_END]: {
    animationTimingFunction: 'linear', // hold antic pose
    transform: `rotate(${spinAnticDeg.css()}) scale(${ICON_SCALE_ANTIC})`,
  },
  [SPIN_END]: {
    animationTimingFunction: 'linear', // spin to final+overshoot; scale up
    transform: `rotate(${FINAL_SPIN_OVERSHOOT_DEG}) scale(${ICON_SCALE_OS})`,
  },
  [OS_HOLD_END]: {
    animationTimingFunction: 'linear', // HOLD at overshoot (visible!)
    transform: `rotate(${FINAL_SPIN_OVERSHOOT_DEG}) scale(${ICON_SCALE_OS})`,
  },
  [SPIN_HOLD_END]: {
    animationTimingFunction: SETTLE, // settle to exact final; keep scale briefly
    transform: `rotate(${FINAL_SPIN_DEG}) scale(${ICON_SCALE_OS})`,
  },
  '100%': {
    transform: `rotate(${FINAL_SPIN_DEG}) scale(1)`,
  },
});

export const iconWrap = style({
  width: iconSizePx.css(),
  height: iconSizePx.css(),
  display: 'grid',
  placeItems: 'center',
});
export const iconShell = style({
  display: 'grid',
  placeItems: 'center',
  width: '100%',
  height: '100%',
  willChange: 'transform',
});

export const iconTrack = style({
  display: 'grid',
  placeItems: 'center',
  width: '100%',
  height: '100%',
  willChange: 'transform',
  selectors: {
    '&[data-phase="entering"]': {
      animation: `${iconLagIn} ${iconLagInDurationMs.css()} ${springDelayMs.css()} both`,
    },
    '&[data-phase="exiting"]': {
      animation: 'none', // disable lag on exit so spin reads clean
    },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        '&[data-phase="entering"]': {
          animation: `${iconLagIn} 0s 0s both`,
        },
      },
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
  transformOrigin: `50% 50%`,
  transform: `translateZ(0)`,
  willChange: 'transform',
  selectors: {
    '&[data-phase="exiting"]': {
      animation: `${iconRotateExit} ${iconExitTotalMs.css()} 0s both`,
    },
    [`${button}:hover &`]: { color: colorVars.white.css() },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        "&[data-phase='exiting']": {
          animation: `${iconRotateExit} 0s 0s both`,
        },
      },
    },
  },
});
