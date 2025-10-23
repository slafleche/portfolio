import { keyframes, style } from '@vanilla-extract/css';
import {
  m,
  measurementHypotenuse,
} from '@/styles/helpers/measurement';
import { colorVars, themeColours } from '../vars';
import { paddings } from '../helpers/spacing';
import { globalBoxShadow } from '../helpers/shadow';
import { focusOutline } from '../helpers/focusOutline';
import { absolutePosition } from '../helpers/positioning';

/* ===========================
   KNOBS
   =========================== */

const offset = m(26); // visual inset: bottom/left = 26px
const buttonSize = m(66);
const iconSize = m(36);

// Entry motion
const entryDurationMs = 520;
const entryOvershoot = m(14);
const entryShootEase = 'cubic-bezier(0.05, 0.9, 0.1, 1)';
const entrySettleEase = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

// Exit motion
const exitAnticipationNudge = m(8);
const exitAnticipationMs = 120;
const exitTravelMs = 360;
const exitEase = 'cubic-bezier(0.24, 1.2, 0.4, 1)';

// Icon spin sync
const iconAnticipationMs = 180;
const iconFlipMs = 340;
const iconOvershootMs = 160;
const iconSettleMs = 120;
const iconTotalMs =
  iconAnticipationMs + iconFlipMs + iconOvershootMs + iconSettleMs;
const exitTranslationDelayMs = iconAnticipationMs + iconFlipMs;

// Icon rotation
const iconWindupDeg = 12;
const iconOvershootDeg = -182;

/* ===========================
   DERIVED VALUES
   =========================== */

const iconOffsetX = iconSize.divide(10).round();
const iconOffsetY = iconSize.divide(10).round();
const containerSize = buttonSize.multiply(3.6);
const diagonalOffset = offset.multiply(Math.SQRT2);

const endInset = `translateX(${diagonalOffset.css()})`;
const endOvershoot = `translateX(calc(${diagonalOffset.css()} + ${entryOvershoot.css()}))`;
const startOffscreen = `translateX(calc(-100% - ${diagonalOffset.css()}))`;

/* ===========================
   ROOT + RAIL
   =========================== */

export const root = style({
  position: 'fixed',
  left: 0,
  bottom: 0,
  width: containerSize.css(),
  height: containerSize.css(),
  zIndex: 30,
  overflow: 'hidden',
  pointerEvents: 'none',
});

export const rail = style({
  ...absolutePosition.bottomLeft(),
  width: measurementHypotenuse(containerSize).css(),
  height: buttonSize.css(),
  transformOrigin: '0 50%',
  transform: 'translateY(50%) rotate(-45deg)',
  pointerEvents: 'none',
});

/* ===========================
   KEYFRAMES — SHUTTLE
   =========================== */

// smooth overshoot entry
const enterMotion = keyframes({
  '0%': {
    transform: startOffscreen,
    animationTimingFunction: entryShootEase,
  },
  '68%': {
    transform: endOvershoot,
    animationTimingFunction: entrySettleEase,
  },
  '100%': {
    transform: endInset,
  },
});

// anticipation → launch
const exitMotion = keyframes({
  '0%': { transform: endInset },
  '25%': {
    transform: `translateX(calc(${diagonalOffset.css()} - ${exitAnticipationNudge.css()}))`,
  },
  '100%': { transform: startOffscreen },
});

/* ===========================
   SHUTTLE
   =========================== */

export const shuttle = style({
  position: 'absolute',
  left: 0,
  top: 0,
  height: buttonSize.css(),
  width: buttonSize.css(),
  transform: startOffscreen,
  willChange: 'transform',
  pointerEvents: 'auto',
});

export const visible = style({
  animation: `${enterMotion} ${entryDurationMs}ms both`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: endInset,
    },
  },
});

export const leaving = style({
  transform: endInset, // hold during delay to avoid blink
  animation: `${exitMotion} ${exitAnticipationMs + exitTravelMs}ms ${exitEase} ${exitTranslationDelayMs}ms both`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: startOffscreen,
    },
  },
});

/* ===========================
   PAYLOAD (upright content)
   =========================== */

export const payload = style({
  width: '100%',
  height: '100%',
  transform: 'rotate(45deg)',
  transformOrigin: '50% 50%',
  position: 'relative',
});

/* ===========================
   BUTTON
   =========================== */

export const button = style({
  position: 'absolute',
  width: buttonSize.css(),
  height: buttonSize.css(),
  left: 0,
  bottom: 0,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colorVars.white.alpha(0.95).css(),
  color: colorVars.navBg.css(),
  textDecoration: 'none',
  boxShadow: globalBoxShadow(),
  pointerEvents: 'auto',
  transition: 'box-shadow 220ms ease',
  selectors: {
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

/* ===========================
   GRADIENT
   =========================== */

export const gradient = style({
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  backgroundImage: `linear-gradient(135deg, ${themeColours.lights.b.css()} 0%, ${themeColours.lights.d.css()} 100%)`,
  opacity: 0,
  transition: 'opacity 200ms ease',
  zIndex: 0,
  pointerEvents: 'none',
});

export const gradientVisible = style({
  selectors: {
    [`${root}:hover &`]: { opacity: 1 },
    [`${root}:focus-visible &`]: { opacity: 1 },
  },
});

/* ===========================
   ICON — spin with anticipation
   =========================== */

const iconFlip = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  [`${(iconAnticipationMs / iconTotalMs) * 100}%`]: {
    transform: `rotate(${iconWindupDeg}deg)`,
  },
  [`${((iconAnticipationMs + iconFlipMs) / iconTotalMs) * 100}%`]: {
    transform: 'rotate(-176deg)',
  },
  [`${((iconAnticipationMs + iconFlipMs + iconOvershootMs) / iconTotalMs) * 100}%`]:
    {
      transform: `rotate(${iconOvershootDeg}deg)`,
    },
  '100%': { transform: 'rotate(-180deg)' },
});

export const icon = style({
  position: 'relative',
  zIndex: 1,
  ...paddings({ top: iconOffsetY, right: iconOffsetX }),
  width: iconSize.css(),
  height: iconSize.css(),
  transformOrigin: '50% 50%',
  transition: 'color 200ms ease, transform 200ms ease',
});

export const iconVisible = style({
  selectors: {
    [`${root}:hover &`]: { color: colorVars.white.css() },
    [`${root}:focus-visible &`]: { color: colorVars.white.css() },
  },
});

export const iconLeaving = style({
  animation: `${iconFlip} ${iconTotalMs}ms cubic-bezier(0.45,1.45,0.25,1) forwards`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: 'rotate(-180deg)',
    },
  },
});
