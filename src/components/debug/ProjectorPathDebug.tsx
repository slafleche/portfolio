'use client';

// Debug-only component: keep isolated from production UI.

import {
  type ChangeEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { enData } from '@/lib/locales/translations/en.data';
import { parseSplit } from '@/lib/locales/translations/splitShortcodes';

type ChannelId = 'red' | 'green' | 'blue';

type EasingKey =
  | 'linear'
  | 'smoothstep'
  | 'easeOutCubic'
  | 'easeInOutCubic';

type ChannelConfig = {
  id: ChannelId;
  label: string;
  start: { x: number; y: number };
  showTitle: boolean;
  turns: number;
  amplitude: number;
  decay: number;
  phase: number;
  handedness: 1 | -1;
  easing: EasingKey;
};

type ChannelDefaultsInput = Omit<ChannelConfig, 'label'> & {
  label?: string;
};

type ProjectorPathDefaults = {
  channels?: ChannelDefaultsInput[];
};

type ProjectorPathDebugProps = {
  durationMs: number;
  fontFamily: string;
  fontWeight: number;
  initialDefaults?: ProjectorPathDefaults | null;
};

type CanvasSize = {
  width: number;
  height: number;
  dpr: number;
};

type ChannelPalette = {
  stroke: string;
  text: string;
};

const { first: titleFirstLine, second: titleSecondLine } = parseSplit(
  enData['hero-title'],
);
const TITLE_LINES = [
  titleFirstLine,
  titleSecondLine,
].filter(Boolean);
const TITLE_FONT_SIZE = 80;
const TITLE_LINE_HEIGHT = TITLE_FONT_SIZE * 1.1;

const DEFAULT_CENTER_OFFSET = {
  x: 0,
  y: 0,
};

const CHANNEL_DEFAULTS: ChannelConfig[] = [
  {
    id: 'blue',
    label: 'Blue',
    start: { x: -220, y: -120 },
    showTitle: true,
    turns: 0.5,
    amplitude: 52,
    decay: 0.85,
    phase: 16,
    handedness: 1,
    easing: 'easeOutCubic',
  },
  {
    id: 'green',
    label: 'Green',
    start: { x: 180, y: 140 },
    showTitle: true,
    turns: 0.5,
    amplitude: 48,
    decay: 0.85,
    phase: -10,
    handedness: -1,
    easing: 'easeOutCubic',
  },
  {
    id: 'red',
    label: 'Red',
    start: { x: 240, y: -60 },
    showTitle: true,
    turns: 0.5,
    amplitude: 58,
    decay: 0.85,
    phase: 6,
    handedness: 1,
    easing: 'easeOutCubic',
  },
];

const CHANNEL_PALETTE: Record<ChannelId, ChannelPalette> = {
  blue: {
    stroke: 'rgba(52, 241, 255, 0.9)',
    text: 'rgba(52, 241, 255, 0.9)',
  },
  green: {
    stroke: 'rgba(156, 255, 159, 0.9)',
    text: 'rgba(156, 255, 159, 0.9)',
  },
  red: {
    stroke: 'rgba(237, 57, 96, 0.9)',
    text: 'rgba(237, 57, 96, 0.9)',
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const degToRad = (value: number) =>
  (value * Math.PI) / 180;

const easingMap: Record<EasingKey, (t: number) => number> = {
  linear: (t) => t,
  smoothstep: (t) => t * t * (3 - 2 * t),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

const isEasingKey = (value: unknown): value is EasingKey =>
  value === 'linear' ||
  value === 'smoothstep' ||
  value === 'easeOutCubic' ||
  value === 'easeInOutCubic';

const resolveDefaults = (
  input?: ProjectorPathDefaults | null,
) => {
  const overridesById = new Map<ChannelId, ChannelDefaultsInput>();
  input?.channels?.forEach((channel) => {
    if (!channel) return;
    overridesById.set(channel.id, channel);
  });

  const channels = CHANNEL_DEFAULTS.map((channel) => {
    const override = overridesById.get(channel.id);
    if (!override) {
      return {
        ...channel,
        start: { ...channel.start },
      };
    }
    const nextHandedness =
      override.handedness === -1 || override.handedness === 1
        ? override.handedness
        : channel.handedness;
    const nextEasing = isEasingKey(override.easing)
      ? override.easing
      : channel.easing;

    return {
      ...channel,
      start: { ...channel.start, ...(override.start ?? {}) },
      showTitle: override.showTitle ?? channel.showTitle,
      turns: override.turns ?? channel.turns,
      amplitude: override.amplitude ?? channel.amplitude,
      decay: override.decay ?? channel.decay,
      phase: override.phase ?? channel.phase,
      handedness: nextHandedness,
      easing: nextEasing,
    };
  });

  return {
    channels,
    centerOffset: {
      x: DEFAULT_CENTER_OFFSET.x,
      y: DEFAULT_CENTER_OFFSET.y,
    },
  };
};

const sampleSwirlPosition = (
  config: ChannelConfig,
  t: number,
  center: { x: number; y: number },
) => {
  const phi = 1.61803398875;
  const startRadius = Math.max(
    1,
    Math.hypot(config.start.x, config.start.y),
  );
  const startAngle = Math.atan2(config.start.y, config.start.x);
  const progress = clamp(t, 0, 1);
  const deltaTheta =
    config.turns * Math.PI * 2 * progress * config.handedness;
  const angle = startAngle + degToRad(config.phase) + deltaTheta;
  const baseRadius = startRadius + config.amplitude;
  const spiralScale = Math.pow(
    phi,
    -config.decay * (2 / Math.PI) * Math.abs(deltaTheta),
  );
  const radius = baseRadius * spiralScale;

  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
};

const numberInputStyle = {
  width: '100%',
  padding: '10px 12px',
  height: 52,
  borderRadius: 6,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  background: 'rgba(10, 6, 22, 0.6)',
  color: '#f4f4f8',
  fontSize: 16,
  lineHeight: 1.2,
} as const;

const numberFieldRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 40px',
  gap: 8,
  alignItems: 'center',
} as const;

const stepperStackStyle = {
  display: 'grid',
  gridTemplateRows: 'repeat(2, 40px)',
  gap: 4,
} as const;

const stepperButtonStyle = {
  width: 40,
  height: 40,
  borderRadius: 6,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  background: 'rgba(255, 255, 255, 0.08)',
  color: '#f4f4f8',
  fontSize: 18,
  lineHeight: 1,
  cursor: 'pointer',
} as const;

const labelStyle = {
  fontSize: 12,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  color: 'rgba(255, 255, 255, 0.6)',
} as const;

const fieldStyle = {
  display: 'grid',
  gap: 6,
} as const;

const sectionStyle = {
  display: 'grid',
  gap: 12,
} as const;

const readoutStyle = {
  fontSize: 13,
  color: 'rgba(255, 255, 255, 0.7)',
} as const;

const buttonStyle = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  background: 'rgba(255, 255, 255, 0.06)',
  color: '#f4f4f8',
  fontSize: 14,
  cursor: 'pointer',
} as const;

const sliderStyle = {
  width: '100%',
} as const;

const inputGroupStyle = {
  display: 'grid',
  gap: 8,
} as const;

const helperTextStyle = {
  fontSize: 12,
  color: 'rgba(255, 255, 255, 0.55)',
  lineHeight: 1.4,
} as const;

const saveStatusStyle = {
  fontSize: 12,
  color: 'rgba(255, 255, 255, 0.6)',
} as const;

const detailsStyle = {
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 12,
  padding: 12,
  display: 'grid',
  gap: 12,
} as const;

const summaryStyle = {
  listStyle: 'none',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  color: '#f4f4f8',
} as const;

const detailsBodyStyle = {
  display: 'grid',
  gap: 12,
} as const;

const mainLayoutStyle = {
  height: '100vh',
  display: 'grid',
  gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
  gap: 12,
  padding: 0,
  overflow: 'hidden',
} as const;

const leftPanelStyle = {
  display: 'grid',
  gap: 12,
  overflowY: 'auto' as const,
  padding: 12,
} as const;

const rightPanelStyle = {
  position: 'sticky' as const,
  top: 0,
  height: '100vh',
  overflow: 'hidden',
} as const;

const toggleStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  color: '#f4f4f8',
} as const;

const toggleInputStyle = {
  width: 16,
  height: 16,
  accentColor: '#f4f4f8',
} as const;

const summaryToggleStyle = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
  gap: 8,
} as const;

const summaryLabelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#f4f4f8',
} as const;

const summaryCheckboxStyle = {
  width: 18,
  height: 18,
  accentColor: '#f4f4f8',
} as const;

const selectStyle = {
  ...numberInputStyle,
  paddingRight: 28,
} as const;

const getCanvasSize = (canvas: HTMLCanvasElement): CanvasSize => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));

  if (canvas.width !== width) {
    canvas.width = width;
  }
  if (canvas.height !== height) {
    canvas.height = height;
  }

  return {
    width: rect.width,
    height: rect.height,
    dpr,
  };
};

const getStepPrecision = (value: number) => {
  const valueString = value.toString();
  if (!valueString.includes('.')) return 0;
  return valueString.split('.')[1]?.length ?? 0;
};

const clampValue = (value: number, min?: number, max?: number) => {
  if (typeof min === 'number') {
    value = Math.max(min, value);
  }
  if (typeof max === 'number') {
    value = Math.min(max, value);
  }
  return value;
};

const NumberField = ({
  label,
  value,
  step = 1,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}) => {
  const holdRef = useRef<number | null>(null);
  const holdTimeoutRef = useRef<number | null>(null);
  const valueRef = useRef(value);
  const precision = getStepPrecision(step);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (Number.isNaN(next)) return;
    onChange(clampValue(next, min, max));
  };

  const nudge = (direction: 1 | -1) => {
    const current = valueRef.current;
    const next = Number.isFinite(current)
      ? current + step * direction
      : step;
    const clamped = clampValue(next, min, max);
    const rounded =
      precision > 0
        ? Number(clamped.toFixed(precision))
        : clamped;
    onChange(rounded);
  };

  const stopHold = (
    event?: React.PointerEvent<HTMLButtonElement>,
  ) => {
    if (event?.currentTarget.hasPointerCapture(event.pointerId)) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {}
    }
    if (holdTimeoutRef.current !== null) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdRef.current !== null) {
      window.clearInterval(holdRef.current);
      holdRef.current = null;
    }
  };

  const startHold = (
    event: React.PointerEvent<HTMLButtonElement>,
    direction: 1 | -1,
  ) => {
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}
    nudge(direction);
    stopHold();
    holdTimeoutRef.current = window.setTimeout(() => {
      holdRef.current = window.setInterval(() => {
        nudge(direction);
      }, 80);
    }, 220);
  };

  useEffect(() => stopHold, []);

  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={numberFieldRowStyle}>
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          onChange={handleChange}
          style={numberInputStyle}
        />
        <div style={stepperStackStyle}>
          <button
            type="button"
            style={stepperButtonStyle}
            onPointerDown={(event) => startHold(event, 1)}
            onPointerUp={stopHold}
            onPointerCancel={stopHold}
            onPointerLeave={stopHold}
            aria-label={`Increase ${label}`}
          >
            ▲
          </button>
          <button
            type="button"
            style={stepperButtonStyle}
            onPointerDown={(event) => startHold(event, -1)}
            onPointerUp={stopHold}
            onPointerCancel={stopHold}
            onPointerLeave={stopHold}
            aria-label={`Decrease ${label}`}
          >
            ▼
          </button>
        </div>
      </div>
    </label>
  );
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: { label: string; value: string }[];
}) => (
  <label style={fieldStyle}>
    <span style={labelStyle}>{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={selectStyle}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const ToggleField = ({
  label,
  checked,
  onChange,
  inputRef,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}) => (
  <label style={toggleStyle}>
    <input
      ref={inputRef}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      style={toggleInputStyle}
    />
    <span>{label}</span>
  </label>
);

export default function ProjectorPathDebug({
  durationMs,
  fontFamily,
  fontWeight,
  initialDefaults,
}: ProjectorPathDebugProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const masterToggleRef = useRef<HTMLInputElement | null>(null);
  const initialConfig = useMemo(
    () => resolveDefaults(initialDefaults),
    [initialDefaults],
  );
  const [channels, setChannels] = useState<ChannelConfig[]>(() =>
    initialConfig.channels.map((channel) => ({
      ...channel,
      start: { ...channel.start },
    })),
  );
  const centerOffset = DEFAULT_CENTER_OFFSET;
  const [timeMs, setTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  const maxDuration = Math.max(durationMs, 1);
  const progress = clamp(timeMs / maxDuration, 0, 1);
  const showReset = isPlaying || timeMs > 0;
  const allTitlesVisible = channels.every((channel) => channel.showTitle);
  const anyTitlesVisible = channels.some((channel) => channel.showTitle);

  const updateChannel = useCallback(
    (id: ChannelId, updater: (channel: ChannelConfig) => ChannelConfig) => {
      setChannels((prev) =>
        prev.map((channel) =>
          channel.id === id ? updater(channel) : channel,
        ),
      );
    },
    [],
  );

  const handleScrub = useCallback((nextValue: number) => {
    setIsPlaying(false);
    setTimeMs(clamp(nextValue, 0, maxDuration));
  }, [maxDuration]);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const payload = {
        centerOffset: DEFAULT_CENTER_OFFSET,
        channels: channels.map((channel) => ({
          id: channel.id,
          start: channel.start,
          showTitle: channel.showTitle,
          turns: channel.turns,
          amplitude: channel.amplitude,
          decay: channel.decay,
          phase: channel.phase,
          handedness: channel.handedness,
          easing: channel.easing,
        })),
      };

      const response = await fetch('/api/debug/projectorPath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload, null, 2),
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [channels]);

  useEffect(() => {
    if (masterToggleRef.current) {
      masterToggleRef.current.indeterminate =
        anyTitlesVisible && !allTitlesVisible;
    }
  }, [anyTitlesVisible, allTitlesVisible]);

  useEffect(() => {
    if (saveStatus !== 'saved' && saveStatus !== 'error') return undefined;
    const timer = window.setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [saveStatus]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const nextTime = clamp(elapsed, 0, maxDuration);
      setTimeMs(nextTime);
      if (elapsed < maxDuration) {
        rafId = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, maxDuration]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = getCanvasSize(canvas);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const center = {
      x: width / 2 + centerOffset.x,
      y: height / 2 + centerOffset.y,
    };

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${fontWeight} ${TITLE_FONT_SIZE}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    channels.forEach((channel) => {
      const palette = CHANNEL_PALETTE[channel.id];
      const steps = 240;
      ctx.beginPath();
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const point = sampleSwirlPosition(channel, t, center);
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.strokeStyle = palette.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    channels.forEach((channel) => {
      if (!channel.showTitle) return;
      const palette = CHANNEL_PALETTE[channel.id];
      const easedProgress = easingMap[channel.easing](progress);
      const point = sampleSwirlPosition(channel, easedProgress, center);

      ctx.fillStyle = palette.text;
      TITLE_LINES.forEach((line, index) => {
        const offset =
          (index - (TITLE_LINES.length - 1) / 2) * TITLE_LINE_HEIGHT;
        ctx.fillText(line, point.x, point.y + offset);
      });
    });
  }, [
    centerOffset.x,
    centerOffset.y,
    channels,
    fontFamily,
    fontWeight,
    progress,
  ]);

  useEffect(() => {
    drawFrame();
  }, [drawFrame]);

  useEffect(() => {
    const handleResize = () => drawFrame();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  const channelControls = useMemo(
    () =>
      channels.map((channel) => (
        <details
          open
          key={channel.id}
          style={detailsStyle}
        >
          <summary style={summaryStyle}>
            <span style={summaryToggleStyle}>
              <input
                type="checkbox"
                checked={channel.showTitle}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => {
                  const checked = event.target.checked;
                  updateChannel(channel.id, (prev) => ({
                    ...prev,
                    showTitle: checked,
                  }));
                }}
                style={summaryCheckboxStyle}
                aria-label={`${channel.label} title visibility`}
              />
              <span style={summaryLabelStyle}>
                {channel.label} channel
              </span>
            </span>
          </summary>
          <div style={detailsBodyStyle}>
            <div style={inputGroupStyle}>
              <NumberField
                label="Start X"
                value={channel.start.x}
                step={5}
                onChange={(value) =>
                  updateChannel(channel.id, (prev) => ({
                    ...prev,
                    start: {
                      ...prev.start,
                      x: value,
                    },
                  }))
                }
              />
              <NumberField
                label="Start Y"
                value={channel.start.y}
                step={5}
                onChange={(value) =>
                  updateChannel(channel.id, (prev) => ({
                    ...prev,
                    start: {
                      ...prev.start,
                      y: value,
                    },
                  }))
                }
              />
            </div>
            <div style={inputGroupStyle}>
              <NumberField
                label="Turns"
                value={channel.turns}
                step={0.1}
                onChange={(value) =>
                  updateChannel(channel.id, (prev) => ({
                    ...prev,
                    turns: value,
                  }))
                }
              />
              <NumberField
                label="Amplitude"
                value={channel.amplitude}
                step={2}
                onChange={(value) =>
                  updateChannel(channel.id, (prev) => ({
                    ...prev,
                    amplitude: value,
                  }))
                }
              />
              <NumberField
                label="Decay"
                value={channel.decay}
                step={0.1}
                onChange={(value) =>
                  updateChannel(channel.id, (prev) => ({
                    ...prev,
                    decay: Math.max(0.1, value),
                  }))
                }
              />
            </div>
            <div style={inputGroupStyle}>
              <NumberField
                label="Phase (deg)"
                value={channel.phase}
                step={5}
                onChange={(value) =>
                  updateChannel(channel.id, (prev) => ({
                    ...prev,
                    phase: value,
                  }))
                }
              />
              <SelectField
                label="Handedness"
                value={String(channel.handedness)}
                onChange={(value) =>
                  updateChannel(channel.id, (prev) => ({
                    ...prev,
                    handedness: value === '-1' ? -1 : 1,
                  }))
                }
                options={[
                  { label: 'Clockwise', value: '1' },
                  { label: 'Counter-clockwise', value: '-1' },
                ]}
              />
              <SelectField
                label="Easing"
                value={channel.easing}
                onChange={(value) =>
                  updateChannel(channel.id, (prev) => ({
                    ...prev,
                    easing: value as EasingKey,
                  }))
                }
                options={[
                  { label: 'Linear', value: 'linear' },
                  { label: 'Smoothstep', value: 'smoothstep' },
                  { label: 'Ease-out cubic', value: 'easeOutCubic' },
                  { label: 'Ease-in-out cubic', value: 'easeInOutCubic' },
                ]}
              />
            </div>
          </div>
        </details>
      )),
    [channels, updateChannel],
  );

  return (
    <main
      style={{
        ...mainLayoutStyle,
        color: '#f4f4f8',
        fontFamily,
      }}
      data-debug="projector-path"
    >
      <div style={leftPanelStyle}>
        <header>
          <h1 style={{ margin: 0, fontSize: 32 }}>Projector Path Debug</h1>
          <p style={{ ...helperTextStyle, margin: 0 }}>
            Debug-only canvas preview for three RGB swirl paths converging at
            center. Adjust values and scrub time to inspect the motion.
          </p>
        </header>
        <div style={sectionStyle}>
          <ToggleField
            label="Show all titles"
            checked={allTitlesVisible}
            inputRef={masterToggleRef}
            onChange={(value) =>
              setChannels((prev) =>
                prev.map((channel) => ({
                  ...channel,
                  showTitle: value,
                })),
              )
            }
          />
          <div style={sectionStyle}>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => {
                if (showReset) {
                  setIsPlaying(false);
                  setTimeMs(0);
                } else {
                  setTimeMs(0);
                  setIsPlaying(true);
                }
              }}
            >
              {showReset ? 'Reset' : 'Animate'}
            </button>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => {
                void handleSave();
              }}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save defaults'}
            </button>
            {saveStatus === 'saved' ? (
              <div style={saveStatusStyle}>Saved to defaults file.</div>
            ) : null}
            {saveStatus === 'error' ? (
              <div style={saveStatusStyle}>
                Save failed. Check the dev API route.
              </div>
            ) : null}
            <div style={readoutStyle}>
              Duration: {Math.round(maxDuration)}ms
            </div>
            <div style={inputGroupStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>Scrub</span>
                <input
                  type="range"
                  min={0}
                  max={Math.round(maxDuration)}
                  step={1}
                  value={Math.round(timeMs)}
                  onChange={(event) =>
                    handleScrub(Number(event.target.value))
                  }
                  style={sliderStyle}
                />
              </label>
              <div style={readoutStyle}>
                Time: {Math.round(timeMs)}ms ({Math.round(progress * 100)}%)
              </div>
            </div>
          </div>
          {channelControls}
        </div>
      </div>
      <div style={rightPanelStyle}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), rgba(4,4,8,0.9) 65%)',
          }}
        />
      </div>
    </main>
  );
}
