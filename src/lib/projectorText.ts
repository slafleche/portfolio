import type { IMeasurement } from 'css-calipers';

import {
  projectorChannels,
  projectorVars,
} from '../styles/componentTokens/projector.component.tokens';

type Tier = 'desktop';

type PlayOptions = {
  tier?: Tier;
  prefersReducedMotion?: boolean;
  debugFreezeStage?: 'initial' | 'waypoint' | 'focus' | 'reveal';
};

type PlayHandle = Promise<void> & { cancel: () => void };

type ChannelTransform = {
  x: number;
  y: number;
  scale: number;
  blur: number;
};

type InterpolatedStage = {
  x: number;
  y: number;
  scale: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (from: number, to: number, t: number) =>
  from + (to - from) * t;

const formatPx = (value: number) => `${value.toFixed(3)}px`;
const formatScale = (value: number) =>
  value === 1 ? '1' : value.toFixed(4);

const activeAnimations = new WeakMap<HTMLElement, () => void>();

const getStageTimings = () => {
  const calibration = projectorVars.timing.calibration;

  const initialHoldEnd = calibration.initialHoldTime.getValue();
  const toWayPointEnd =
    initialHoldEnd + calibration.toWayPointTime.getValue();
  const waypointHoldEnd =
    toWayPointEnd + calibration.waypointHoldTime.getValue();
  const toFocusEnd =
    waypointHoldEnd + calibration.toFocusTime.getValue();

  const totalCalibration =
    calibration.totalCalibrationTime.getValue();

  const revealTiming = projectorVars.timing.textReveal;
  const revealStart =
    totalCalibration +
    revealTiming.offsetFromCalibrationEnd.getValue();
  const revealEnd = revealStart + revealTiming.duration.getValue();

  const totalDuration = Math.max(toFocusEnd, revealEnd);

  return {
    initialHoldEnd,
    toWayPointEnd,
    waypointHoldEnd,
    toFocusEnd,
    revealStart,
    revealEnd,
    totalDuration,
    totalCalibration,
  };
};

const sampleStage = (
  elapsed: number,
  timings: ReturnType<typeof getStageTimings>,
  stages: {
    initial: InterpolatedStage;
    waypoint: InterpolatedStage;
    focus: InterpolatedStage;
  },
): InterpolatedStage => {
  const {
    initialHoldEnd,
    toWayPointEnd,
    waypointHoldEnd,
    toFocusEnd,
  } = timings;

  if (elapsed <= initialHoldEnd) {
    return stages.initial;
  }

  if (elapsed <= toWayPointEnd) {
    const span = Math.max(
      toWayPointEnd - initialHoldEnd,
      Number.EPSILON,
    );
    const t = clamp((elapsed - initialHoldEnd) / span, 0, 1);
    return {
      x: lerp(stages.initial.x, stages.waypoint.x, t),
      y: lerp(stages.initial.y, stages.waypoint.y, t),
      scale: lerp(stages.initial.scale, stages.waypoint.scale, t),
    };
  }

  if (elapsed <= waypointHoldEnd) {
    return stages.waypoint;
  }

  if (elapsed <= toFocusEnd) {
    const span = Math.max(
      toFocusEnd - waypointHoldEnd,
      Number.EPSILON,
    );
    const t = clamp((elapsed - waypointHoldEnd) / span, 0, 1);
    return {
      x: lerp(stages.waypoint.x, stages.focus.x, t),
      y: lerp(stages.waypoint.y, stages.focus.y, t),
      scale: lerp(stages.waypoint.scale, stages.focus.scale, t),
    };
  }

  return stages.focus;
};

type BlurPoint = { time: number; value: number };

const createBlurSeries = (
  blurCurve: Record<number, IMeasurement | number>,
  totalCalibration: number,
): BlurPoint[] => {
  return Object.entries(blurCurve)
    .map(([
      percent,
      measurementOrNumber,
    ]) => {
      const measurement =
        typeof measurementOrNumber === 'number'
          ? measurementOrNumber
          : measurementOrNumber.getValue();
      return {
        time: (Number(percent) / 100) * totalCalibration,
        value: measurement,
      };
    })
    .sort((a, b) => a.time - b.time);
};

const sampleBlur = (series: BlurPoint[], elapsed: number): number => {
  if (series.length === 0) return 0;
  if (elapsed <= series[0].time) return series[0].value;
  for (let i = 0; i < series.length - 1; i += 1) {
    const current = series[i];
    const next = series[i + 1];
    if (elapsed <= next.time) {
      const span = Math.max(next.time - current.time, Number.EPSILON);
      const t = clamp((elapsed - current.time) / span, 0, 1);
      return lerp(current.value, next.value, t);
    }
  }
  return series[series.length - 1].value;
};

const applyChannelTransform = (
  element: HTMLElement | null,
  transform: ChannelTransform,
) => {
  if (!element) return;
  element.style.transform = `translate3d(${formatPx(
    transform.x,
  )}, ${formatPx(transform.y)}, 0) scale(${formatScale(transform.scale)})`;
  element.style.filter = `blur(${formatPx(Math.max(transform.blur, 0))})`;
};

const applyFinalState = (
  master: HTMLElement,
  ghost: HTMLElement,
  channels: Record<string, HTMLElement | null>,
  channelStates: Record<string, { focus: InterpolatedStage }>,
) => {
  master.style.opacity = '1';
  master.style.transform = 'scale(1)';
  master.style.filter = 'none';

  ghost.style.opacity = '0';
  ghost.style.filter = 'blur(0px)';

  projectorChannels.forEach((channel) => {
    applyChannelTransform(channels[channel], {
      x: channelStates[channel].focus.x,
      y: channelStates[channel].focus.y,
      scale: channelStates[channel].focus.scale,
      blur: 0,
    });
  });
};

export function playProjectorText(
  masterEl: HTMLElement,
  ghostEl: HTMLElement,
  _tierOrOptions?: Tier | PlayOptions,
  maybeOpts?: PlayOptions,
): PlayHandle {
  let options: PlayOptions | undefined;

  if (
    typeof _tierOrOptions === 'object' &&
    _tierOrOptions !== null &&
    !('nodeType' in _tierOrOptions)
  ) {
    options = _tierOrOptions;
  } else {
    options = maybeOpts;
  }

  const prefersReducedMotion = options?.prefersReducedMotion ?? false;

  const timings = getStageTimings();

  const channelStates = projectorChannels.reduce<
    Record<
      string,
      {
        initial: InterpolatedStage;
        waypoint: InterpolatedStage;
        focus: InterpolatedStage;
        blur: BlurPoint[];
        opacity: number;
      }
    >
  >((acc, channel) => {
    const states = projectorVars.states[channel];
    const toStage = (stage: {
      translateX: IMeasurement;
      translateY: IMeasurement;
      scale: number;
    }): InterpolatedStage => ({
      x: stage.translateX.getValue(),
      y: stage.translateY.getValue(),
      scale: stage.scale,
    });

    acc[channel] = {
      initial: toStage(states.initial),
      waypoint: toStage(states.waypoint),
      focus: toStage(states.focus),
      blur: createBlurSeries(
        states.blurCurve,
        timings.totalCalibration,
      ),
      opacity: states.opacity ?? 0.85,
    };
    return acc;
  }, {});

  const channelElements: Record<
    (typeof projectorChannels)[number],
    HTMLElement | null
  > = {
    blue: ghostEl.querySelector('[data-channel="blue"]'),
    green: ghostEl.querySelector('[data-channel="green"]'),
    red: ghostEl.querySelector('[data-channel="red"]'),
  };

  const cleanupTargets = [
    masterEl,
    ghostEl,
    channelElements.blue,
    channelElements.green,
    channelElements.red,
  ];

  const addWillChange = () => {
    masterEl.style.willChange = 'opacity, transform, filter';
    ghostEl.style.willChange = 'opacity, filter';
    projectorChannels.forEach((channel) => {
      const element = channelElements[channel];
      if (element) {
        element.style.willChange = 'transform, filter';
      }
    });
  };

  const removeWillChange = () => {
    cleanupTargets.forEach((el) => {
      if (!el) return;
      el.style.willChange = '';
    });
  };

  const cancelPrevious = activeAnimations.get(masterEl);
  cancelPrevious?.();

  const freezeStage = options?.debugFreezeStage ?? null;
  const isFrozen = freezeStage !== null && freezeStage !== undefined;

  const applyStageSnapshot = (
    stage: 'initial' | 'waypoint' | 'focus',
  ) => {
    projectorChannels.forEach((channel) => {
      const state = channelStates[channel][stage];
      const blurSeries = channelStates[channel].blur;
      const blurAtStage =
        stage === 'focus'
          ? (blurSeries[blurSeries.length - 1]?.value ?? 0)
          : (blurSeries[0]?.value ?? 0);

      applyChannelTransform(channelElements[channel], {
        ...state,
        blur: blurAtStage,
      });
    });
  };

  const applyRevealSnapshot = () => {
    projectorChannels.forEach((channel) => {
      const state = channelStates[channel].focus;
      const blurSeries = channelStates[channel].blur;
      const blurValue = blurSeries[blurSeries.length - 1]?.value ?? 0;

      applyChannelTransform(channelElements[channel], {
        ...state,
        blur: blurValue,
      });
    });
  };

  if (prefersReducedMotion) {
    addWillChange();
    applyFinalState(
      masterEl,
      ghostEl,
      channelElements,
      channelStates,
    );
    removeWillChange();
    return Object.assign(Promise.resolve(), {
      cancel: () => undefined,
    });
  }

  if (isFrozen) {
    addWillChange();
    const baseGhostOpacity =
      channelStates[projectorChannels[0]]?.opacity ?? 0.85;

    masterEl.style.filter = 'none';
    masterEl.style.transform = 'scale(1)';

    if (freezeStage === 'initial') {
      masterEl.style.opacity = '0';
      ghostEl.style.opacity = baseGhostOpacity.toFixed(3);
      applyStageSnapshot('initial');
    } else if (freezeStage === 'waypoint') {
      masterEl.style.opacity = '0';
      ghostEl.style.opacity = baseGhostOpacity.toFixed(3);
      applyStageSnapshot('waypoint');
    } else if (freezeStage === 'focus') {
      masterEl.style.opacity = '0';
      ghostEl.style.opacity = baseGhostOpacity.toFixed(3);
      applyStageSnapshot('focus');
    } else if (freezeStage === 'reveal') {
      masterEl.style.opacity = '1';
      ghostEl.style.opacity = '0';
      applyRevealSnapshot();
    }

    removeWillChange();

    return Object.assign(Promise.resolve(), {
      cancel: () => undefined,
    });
  }

  let rafId: number | null = null;
  let startTime: number | null = null;
  let resolved = false;

  const firstChannel = projectorChannels[0];
  const firstChannelState = channelStates[firstChannel];
  const baseGhostOpacity = firstChannelState?.opacity ?? 0.85;

  const applyInitialState = () => {
    masterEl.style.opacity = '0';
    masterEl.style.transform = 'scale(1)';
    masterEl.style.filter = 'none';

    ghostEl.style.opacity = baseGhostOpacity.toFixed(3);
    const initialBlur = firstChannelState?.blur[0]?.value ?? 0;
    ghostEl.style.filter = `blur(${formatPx(initialBlur)})`;

    projectorChannels.forEach((channel) => {
      applyChannelTransform(channelElements[channel], {
        x: channelStates[channel].initial.x,
        y: channelStates[channel].initial.y,
        scale: channelStates[channel].initial.scale,
        blur: channelStates[channel].blur[0]?.value ?? 0,
      });
    });
  };

  const cleanup = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    removeWillChange();
    activeAnimations.delete(masterEl);
  };

  const updateFrame = (elapsed: number) => {
    projectorChannels.forEach((channel) => {
      const state = sampleStage(
        elapsed,
        timings,
        channelStates[channel],
      );
      const blur = sampleBlur(channelStates[channel].blur, elapsed);

      applyChannelTransform(channelElements[channel], {
        ...state,
        blur,
      });
    });

    let masterOpacity = 0;
    let ghostOpacity = baseGhostOpacity;

    if (elapsed >= timings.revealStart) {
      const span = Math.max(
        timings.revealEnd - timings.revealStart,
        Number.EPSILON,
      );
      const t = clamp((elapsed - timings.revealStart) / span, 0, 1);
      masterOpacity = t;
      ghostOpacity = lerp(baseGhostOpacity, 0, t);
    }

    if (elapsed >= timings.revealEnd) {
      masterOpacity = 1;
      ghostOpacity = 0;
    }

    masterEl.style.opacity = masterOpacity.toFixed(3);
    ghostEl.style.opacity = ghostOpacity.toFixed(3);
  };

  const step = (timestamp: number) => {
    if (startTime === null) {
      startTime = timestamp;
    }
    const elapsed = timestamp - startTime;
    updateFrame(elapsed);

    if (elapsed < timings.totalDuration) {
      rafId = requestAnimationFrame(step);
    } else {
      updateFrame(timings.totalDuration);
      if (!resolved) {
        resolved = true;
        cleanup();
        fulfill();
      }
    }
  };

  let fulfill!: () => void;
  const promise = new Promise<void>((resolve) => {
    fulfill = resolve;
  });

  addWillChange();
  applyInitialState();

  rafId = requestAnimationFrame(step);

  const handle = Object.assign(promise, {
    cancel: () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      fulfill();
    },
  });

  activeAnimations.set(masterEl, handle.cancel);

  return handle;
}
