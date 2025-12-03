import { color } from '../helpers/colorWrap.helper';
import { assertCondition, assertUnit, m } from '../measurementKit';
import { dropShadowVars } from '../../tokens/global.tokens';

export type ProjectorChannel = 'blue' | 'green' | 'red';
export type ProjectorStage = 'initial' | 'waypoint' | 'focus';

export const projectorChannels: readonly ProjectorChannel[] = [
  'blue',
  'green',
  'red',
] as const;

export const projectorStages: readonly ProjectorStage[] = [
  'initial',
  'waypoint',
  'focus',
] as const;

// type StageOffsets = Record<ProjectorChannel, { x: number; y: number }>;
// type StageBlur = Record<ProjectorChannel, ReturnType<typeof m>>;
// type StageScale = Record<ProjectorChannel, number>;

const initialHoldTime = m(200, 'ms');
const toWayPointTime = m(800, 'ms');
const waypointHoldTime = m(0, 'ms');
const toFocusTime = m(100, 'ms');

if (process.env.NODE_ENV !== 'production') {
  assertCondition(() => {
    return (
      toWayPointTime.getValue() > 0 && toFocusTime.getValue() > 0
    );
  }, "Calculating 'calibration' times requires positive durations.");
  assertUnit(toWayPointTime, 'ms', 'toWayPointTime - needs to be ms');
  assertUnit(toFocusTime, 'ms', 'toFocusTime - needs to be ms');
}
const calibrationTime = initialHoldTime
  .add(toWayPointTime)
  .add(waypointHoldTime)
  .add(toFocusTime);

export const projectorCalibrationDurations = {
  initialHold: initialHoldTime,
  toWayPoint: toWayPointTime,
  waypointHold: waypointHoldTime,
  toFocus: toFocusTime,
  totalCalibration: calibrationTime,
} as const;

export const projectorVars = {
  cta: {
    delay: m(500, 'ms'),
  },
  colors: {
    blue: color('#34f1ff').alpha(0.7),
    green: color('#9cff9f').alpha(0.8),
    red: color('#ed3960').alpha(0.8),
  },
  textShadow: {
    ...dropShadowVars,
  },
  timing: {
    calibration: {
      initialHoldTime,
      toWayPointTime,
      waypointHoldTime,
      toFocusTime,
      totalCalibrationTime: calibrationTime,
    },
    textReveal: {
      offsetFromCalibrationEnd: m(0, 'ms'),
      duration: m(800, 'ms'),
    },
  },
  states: {
    blue: {
      opacity: 0.85,
      initial: {
        translateX: m(-6.6),
        translateY: m(-8.85),
        scale: 1.02,
      },
      waypoint: {
        translateX: m(2.5),
        translateY: m(4.65),
        scale: 0.99,
      },
      focus: {
        translateX: m(0),
        translateY: m(0),
        scale: 1,
      },
      blurCurve: {
        0: m(4.1),
        60: m(7),
        80: m(2),
        100: m(0),
      },
    },
    green: {
      opacity: 0.55,
      initial: {
        translateX: m(7.4),
        translateY: m(6.6),
        scale: 1.008,
      },
      waypoint: {
        translateX: m(-2.52),
        translateY: m(-1.58),
        scale: 1.003,
      },
      focus: {
        translateX: m(0),
        translateY: m(0),
        scale: 1,
      },
      blurCurve: {
        0: m(9),
        20: m(15.7),
        72: m(1.3),
        87: m(3.8),
        100: m(0),
      },
    },
    red: {
      opacity: 0.65,
      initial: {
        translateX: m(9.6),
        translateY: m(-5.5),
        scale: 1.012,
      },
      waypoint: {
        translateX: m(-3.2),
        translateY: m(3.85),
        scale: 1.006,
      },
      focus: {
        translateX: m(0),
        translateY: m(0),
        scale: 1,
      },
      blurCurve: {
        0: m(6.5),
        28: m(6.3),
        52: m(4.6),
        78: m(5.4),
        93: m(3.9),
        100: m(0),
      },
    },
  },
} as const;

export type ProjectorVars = typeof projectorVars;
