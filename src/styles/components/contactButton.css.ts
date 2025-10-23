import { keyframes, style } from '@vanilla-extract/css';
import {
  m,
  measurementHypotenuse,
} from '@/styles/helpers/measurement';
import { colorVars, themeColours } from '../vars';
import { globalBoxShadow } from '../helpers/shadow';
import { focusOutline } from '../helpers/focusOutline';
import { absolutePosition } from '../helpers/positioning';

/* ============================================================================
   KNOBS — all units annotated
   ============================================================================ */

/** Layout (px via m()) */
const offset = m(26); // px — inset of final resting button along each axis before rotation
const buttonSize = m(66); // px — circular button diameter
const iconSize = m(36); // px — glyph box (not stroke size)

/** Easing curves */
const SNAP = 'cubic-bezier(0.45, 0, 0.2, 1)'; // snap/impact
const SETTLE = 'cubic-bezier(0.2, 0.8, 0.2, 1)'; // soft settle
const FAST = 'cubic-bezier(0.05, 0.9, 0.1, 1)'; // quick push (entry)

/** Shuttle timing (translate along 45° rail) */
const shuttleDurationMs = 520; // ms — entry duration
const shuttleExitDurationMs = shuttleDurationMs; // ms — exit mirrors entry

/** Entry overshoot (translate past rest, then settle) */
const entryOvershoot = m(14); // px

/** Exit push (translate farther into corner before snapping off) */
const exitPush = m(22); // px
const shuttleHoldPctA = 30; // % — reach pushed position
const shuttleHoldPctB = 50; // % — hold pushed position so it reads

/** Icon rotation (SVG glyph) */
const iconExitTotalMs = 780; // ms — total rotate-out time
const iconWindupDeg = 20; // deg — anticipation (+deg)
const iconOvershootDeg = -20; // deg — overshoot OFFSET around final target (negative = past, positive = short)
const iconFinalRotationDeg = -540; // deg — final facing (≡ -180° after one extra turn)
const iconBaseRotationDeg = 0; // deg — keep 0 now that the SVG is optically centered

/** Exit translation start (phase control relative to icon timeline) */
const shuttleStartPct = 0.68; // 0–1 — when shuttle translation begins (relative to icon timeline)
const shuttleStartOffsetMs = 0; // ms — optional extra offset after shuttleStartPct

/** Derived: exit translation delay (ms) */
const exitTranslationDelayMs = Math.round(
  iconExitTotalMs * shuttleStartPct + shuttleStartOffsetMs,
);

/** Icon spring (translation lag on shell) */
const springDelayMs = 50; // ms — lag behind shuttle on both directions

/** Entry spring (icon shell translate) */
const iconLagInDistance = m(8); // px — initial offset
const iconLagInMicro = m(3); // px — micro rebound
const iconLagInDuration = 160; // ms

/** Exit spring (lags shuttle; push direction: +X, -Y) */
const iconLagOutDistance = m(3); // px
const iconLagOutDuration = shuttleExitDurationMs; // ms

/** Motion shadow while moving — cheap hard shadow */
const motionShadow = '0 2px 6px rgba(0,0,0,0.18)';

/* ============================================================================
   DERIVED
   ============================================================================ */

const containerSize = buttonSize.multiply(3.6); // px — canvas size
const diagonalOffset = offset.multiply(Math.SQRT2); // px — 45° inset

const startOffscreen = `translate3d(calc(-100% - ${diagonalOffset.css()}),0,0)`;
const endInset = `translate3d(${diagonalOffset.css()},0,0)`;
const endOvershoot = `translate3d(calc(${diagonalOffset.css()} + ${entryOvershoot.css()}),0,0)`;

/* ============================================================================
   STRUCTURE
   ============================================================================ */

export const root = style({
  position: 'fixed',
  left: 0,
  bottom: 0,
  width: containerSize.css(),
  height: containerSize.css(),
  zIndex: 30,
  overflow: 'hidden',
  pointerEvents: 'auto',
});

export const rail = style({
  ...absolutePosition.bottomLeft(),
  width: measurementHypotenuse(containerSize).css(),
  height: buttonSize.css(),
  transformOrigin: '0 50%',
  transform: 'translateY(50%) rotate(-45deg)', // align local X to ↗︎ diagonal
  pointerEvents: 'none',
});

/* ============================================================================
   SHUTTLE (translate along rail)
   ============================================================================ */

/** Entry: offscreen → overshoot → settle */
const enterMotion = keyframes({
  '0%': { transform: startOffscreen, animationTimingFunction: FAST },
  '68%': { transform: endOvershoot, animationTimingFunction: SETTLE },
  '100%': { transform: endInset },
});

/** Exit: push PAST corner → HOLD → snap OFFSCREEN */
const shuttlePushed = `translate3d(calc(${diagonalOffset.css()} + ${exitPush.css()}),0,0)`;
const shuttleExit = keyframes({
  '0%': { transform: endInset, animationTimingFunction: SNAP },
  [`${shuttleHoldPctA}%`]: {
    transform: shuttlePushed,
    animationTimingFunction: 'linear',
  }, // arrive at push
  [`${shuttleHoldPctB}%`]: {
    transform: shuttlePushed,
    animationTimingFunction: SNAP,
  }, // hold visibly
  '100%': { transform: startOffscreen }, // snap away
});

export const shuttle = style({
  position: 'absolute',
  left: 0,
  top: 0,
  height: buttonSize.css(),
  width: buttonSize.css(),
  transform: `${startOffscreen} translateZ(0)`,
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  pointerEvents: 'auto',
});

export const visible = style({
  animation: `${enterMotion} ${shuttleDurationMs}ms both`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: endInset,
    },
  },
});

export const leaving = style({
  transform: endInset, // hold at rest until delay (prevents blink)
  animation: `${shuttleExit} ${shuttleExitDurationMs}ms ${SNAP} ${exitTranslationDelayMs}ms both`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
      transform: startOffscreen,
    },
  },
});

/* ============================================================================
   PAYLOAD (upright content inside rotated rail)
   ============================================================================ */

export const payload = style({
  width: '100%',
  height: '100%',
  transform: 'rotate(45deg)',
  transformOrigin: '50% 50%',
  position: 'relative',
});

/* ============================================================================
   BUTTON
   ============================================================================ */

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

  // Idle: global blur shadow
  boxShadow: globalBoxShadow(),

  pointerEvents: 'auto',
  transition: 'box-shadow 220ms ease', // ms
  willChange: 'transform',

  selectors: {
    // During motion: cheap/hard shadow + no transition
    [`${visible} &`]: { boxShadow: motionShadow, transition: 'none' },
    [`${leaving} &`]: {
      pointerEvents: 'none',
      boxShadow: motionShadow,
      transition: 'none',
    },

    // Idle hover/focus: heavier blur
    '&:hover, &:focus-visible': {
      boxShadow: globalBoxShadow({ blur: m(12) }),
    },

    '&:focus-visible': focusOutline({
      color: themeColours.lights.b
        .mix(themeColours.lights.d, 0.5)
        .css(),
      width: m(3), // px
      offset: m(4), // px
    }),
  },
});

/* ============================================================================
   GRADIENT (hover)
   ============================================================================ */

export const gradient = style({
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  backgroundImage: `linear-gradient(135deg, ${themeColours.lights.b.css()} 0%, ${themeColours.lights.d.css()} 100%)`,
  opacity: 0,
  transition: 'opacity 200ms ease', // ms
  zIndex: 0,
  pointerEvents: 'none',
  willChange: 'opacity',
  selectors: {
    [`${leaving} &`]: { opacity: 0 }, // avoid overdraw while exiting
  },
});

export const gradientVisible = style({
  selectors: {
    [`${button}:hover &`]: { opacity: 1 },
    [`${button}:focus-visible &`]: { opacity: 1 },
  },
});

/* ============================================================================
   ICON (barrel roll + spring)
   ============================================================================ */

/**
 * Wrapper: size owner; no optical offset, no rotation (SVG is
 * centered now)
 */
export const iconWrap = style({
  width: iconSize.css(),
  height: iconSize.css(),
  display: 'grid',
  placeItems: 'center',
  overflow: 'visible',
  transform: 'translate3d(0,0,0)',
});

/**
 * Barrel roll with readable small overshoot: 0 → wind-up → SNAP to
 * (final + overshoot) → dwell → settle at final. Final is -540° (≡
 * -180° after one full turn). Keyframes include the base rotation
 * (iconBaseRotationDeg) so there’s no composition jump.
 */
const base = (deg: number) => `${iconBaseRotationDeg + deg}deg`;

const iconRotateExit = keyframes({
  '0%': { transform: `rotate(${base(0)})` },
  '20%': { transform: `rotate(${base(iconWindupDeg)})` }, // anticipation
  '40%': {
    transform: `rotate(${base(iconWindupDeg)})`,
    animationTimingFunction: SNAP,
  }, // brief hold
  '58%': {
    transform: `rotate(calc(${iconBaseRotationDeg + iconFinalRotationDeg}deg + ${iconOvershootDeg}deg))`,
    animationTimingFunction: 'cubic-bezier(0.18,0.92,0.12,1)', // hard snap
  },
  '78%': {
    transform: `rotate(calc(${iconBaseRotationDeg + iconFinalRotationDeg}deg + ${iconOvershootDeg}deg))`,
    animationTimingFunction: SETTLE, // longer dwell so small angles read
  },
  '100%': { transform: `rotate(${base(iconFinalRotationDeg)})` }, // settle exactly flat at final
});

/** Icon SPRING on shell (translate only) — entry lag */
const iconLagIn = keyframes({
  '0%': {
    transform: `translate3d(${iconLagInDistance.negation().css()}, ${iconLagInDistance.css()}, 0)`,
    animationTimingFunction: SNAP,
  },
  '72%': {
    transform: `translate3d(${iconLagInMicro.css()}, ${iconLagInMicro.negation().css()}, 0)`,
    animationTimingFunction: SETTLE,
  },
  '100%': { transform: 'translate3d(0,0,0)' },
});

/**
 * Icon SPRING on shell (translate only) — exit lag; push direction:
 * +X, -Y
 */
const iconLagOut = keyframes({
  '0%': {
    transform: 'translate3d(0,0,0)',
    animationTimingFunction: SNAP,
  },
  '30%': {
    transform: `translate3d(${iconLagOutDistance.css()}, ${iconLagOutDistance.negation().css()}, 0)`,
    animationTimingFunction: 'linear',
  },
  '50%': {
    transform: `translate3d(${iconLagOutDistance.css()}, ${iconLagOutDistance.negation().css()}, 0)`,
    animationTimingFunction: SETTLE,
  },
  '100%': { transform: 'translate3d(0,0,0)' },
});

/** Shell follows the shuttle with delay (entry & exit) */
export const iconShell = style({
  display: 'grid',
  placeItems: 'center',
  width: '100%',
  height: '100%',
  transform: 'translateZ(0)',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  selectors: {
    // Entry: follow with constant lag
    [`${visible} &`]: {
      animation: `${iconLagIn} ${iconLagInDuration}ms ${springDelayMs}ms both`,
    },
    // Exit: start at shuttle delay + lag
    [`${leaving} &`]: {
      animation: `${iconLagOut} ${iconLagOutDuration}ms ${exitTranslationDelayMs + springDelayMs}ms both`,
    },
  },
});

/** The SVG glyph: rotation only; pivot at true center (SVG corrected) */
export const iconGlyph = style({
  display: 'block',
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: '100%',
  transformBox: 'fill-box',
  transformOrigin: '50% 50%', // SVG is now centered; true geometric center is correct
  transform: `translateZ(0) rotate(${iconBaseRotationDeg}deg)`, // base pose (0 by default)
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  selectors: {
    // Hover/focus color shift
    [`${button}:hover &`]: { color: colorVars.white.css() },
    [`${button}:focus-visible &`]: { color: colorVars.white.css() },
    // Exit rotation timeline
    [`${leaving} &`]: {
      animation: `${iconRotateExit} ${iconExitTotalMs}ms both`,
    },
  },
});
