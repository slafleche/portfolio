'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { m } from 'css-calipers';
import { formTokens } from '@/tokens/forms.tokens';
import { glassyButtonTokens } from '@/tokens/glassy.tokens';
import { paddings, margins } from '@/styles/helpers/spacing.helper';
import { backgrounds } from '@/styles/helpers/background.helper';
import borders from '@/styles/helpers/borders.helper';
import { boxShadow } from '@/styles/helpers/shadow.helper';

export type Tone = 'default' | 'info' | 'success' | 'warning' | 'error' | 'muted';

export type TonePalette = Record<
  Tone,
  { border: string; bg: string; accent: string; text: string }
>;

export type TimelineStage = {
  id: string;
  label: string;
  description: string;
};

export type ResponseScenario = {
  id: string;
  label: string;
  description: string;
  stageIndex: number;
  tone?: Tone;
  note?: string;
  ctaState: 'idle' | 'busy' | 'disabled' | 'success' | 'error';
  ctaLabel?: string;
  fieldState: 'editable' | 'readonly' | 'disabled';
  fieldValues?: {
    name?: string;
    email?: string;
    message?: string;
  };
  telemetryEvents?: readonly string[];
};

type Props = {
  stages: readonly TimelineStage[];
  scenarios: readonly ResponseScenario[];
  tonePalette: TonePalette;
  telemetryLegend: readonly TimelineTelemetryDescriptor[];
};

export type TimelineTelemetryDescriptor = {
  event: string;
  label: string;
  description: string;
  dimensions: readonly string[];
};

const stackStyle: CSSProperties = {
  maxWidth: formTokens.layout.maxWidth.css(),
  ...margins({
    vertical: m(0),
    horizontal: 'auto',
  }),
  display: 'flex',
  flexDirection: 'column',
  gap: formTokens.layout.fieldGap.multiply(2).css(),
};

const blockStyle: CSSProperties = {
  borderRadius: 24,
  ...borders({
    all: {
      width: m(1),
      color: 'rgba(245,240,255,0.2)',
    },
  }),
  ...paddings({ all: m(32) }),
  ...backgrounds({ color: 'rgba(8,6,16,0.65)' }),
  boxShadow: boxShadow({
    y: m(40),
    blur: m(140),
  }),
  display: 'flex',
  flexDirection: 'column',
  gap: formTokens.layout.fieldGap.css(),
};

const eyebrowStyle: CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: 2,
  fontSize: 12,
  color: formTokens.label.text.color.css(),
  margin: 0,
};

const titleStyle: CSSProperties = {
  ...margins({
    top: m(0),
    horizontal: m(0),
    bottom: m(4),
  }),
  fontSize: 20,
  color: formTokens.field.text.color.css(),
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: formTokens.layout.fieldGap.css(),
};

const helperTextStyle: CSSProperties = {
  ...margins({
    top: m(8),
    horizontal: m(0),
    bottom: m(0),
  }),
  fontSize: 14,
  color: formTokens.counter.text.color.css(),
  lineHeight: 1.5,
};

const accentListItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  borderLeftWidth: 4,
  borderLeftStyle: 'solid',
  paddingLeft: formTokens.layout.fieldGap.css(),
};

const codeStyle: CSSProperties = {
  fontSize: 12,
  ...paddings({
    vertical: m(2),
    horizontal: m(6),
  }),
  borderRadius: 6,
  ...backgrounds({ color: 'rgba(255,255,255,0.08)' }),
  ...borders({
    all: {
      width: m(1),
      color: 'rgba(255,255,255,0.12)',
    },
  }),
};

const formContainerStyle = {
  borderRadius: 18,
  ...borders({
    all: {
      width: m(1),
      color: 'rgba(245,240,255,0.18)',
    },
  }),
  ...paddings({ all: m(24) }),
  ...backgrounds({ color: 'rgba(6,4,18,0.75)' }),
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
};

const formLabelStyle = {
  fontSize: 13,
  letterSpacing: 0.4,
  textTransform: 'uppercase' as const,
  color: 'rgba(245,240,255,0.65)',
};

export default function SubmissionTimelineSection({
  stages,
  scenarios,
  tonePalette,
  telemetryLegend,
}: Props) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    () => scenarios[0]?.id ?? '',
  );

  const activeScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    scenarios[0];

  const timelineStageTone = tonePalette[activeScenario?.tone ?? 'default'];

  const ctaLabel = activeScenario?.ctaLabel ?? 'Send message';

  const fieldProps = useMemo(() => {
    switch (activeScenario?.fieldState) {
      case 'readonly':
        return { readOnly: true, disabled: false };
      case 'disabled':
        return { readOnly: false, disabled: true };
      default:
        return { readOnly: false, disabled: false };
    }
  }, [activeScenario?.fieldState]);

  const previousScenarioRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeScenario) return;
    if (previousScenarioRef.current === activeScenario.id) return;
    previousScenarioRef.current = activeScenario.id;
    activeScenario.telemetryEvents?.forEach((event) => {
      console.debug('[ContactForm][debug][telemetry]', event, {
        source: 'timeline',
        scenarioId: activeScenario.id,
        stage: stages[activeScenario.stageIndex]?.id ?? null,
      });
    });
  }, [activeScenario, stages]);

  return (
    <div style={stackStyle}>
      <article style={blockStyle}>
        <p style={eyebrowStyle}>Timeline</p>
        <h4 style={titleStyle}>
          Submission flow (interactive)
        </h4>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 20,
          }}
        >
          {scenarios.map((scenario) => {
            const palette = tonePalette[scenario.tone ?? 'default'];
            const isActive = scenario.id === activeScenario?.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setSelectedScenarioId(scenario.id)}
                style={{
                  borderRadius: 999,
                  ...borders({
                    all: {
                      width: m(1),
                      color: palette.border,
                    },
                  }),
                  ...paddings({
                    vertical: m(8),
                    horizontal: m(14),
                  }),
                  ...backgrounds({
                    color: isActive
                      ? palette.accent
                      : 'transparent',
                  }),
                  color: isActive ? '#120a24' : palette.text,
                  cursor: 'pointer',
                  fontSize: 13,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {scenario.label}
              </button>
            );
          })}
        </div>
        <ol style={listStyle}>
          {stages.map((stage, index) => {
            const isActive =
              activeScenario?.stageIndex !== undefined &&
              index <= activeScenario.stageIndex;
            return (
              <li
                key={stage.id}
                style={{
                  ...accentListItemStyle,
                  borderLeftColor: isActive
                    ? timelineStageTone.accent
                    : 'rgba(245,240,255,0.24)',
                  opacity: isActive ? 1 : 0.5,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    color: formTokens.label.text.color.css(),
                  }}
                >
                  Step {index + 1}
                </span>
                <strong>{stage.label}</strong>
                <p
                  style={{ ...helperTextStyle, margin: 0 }}
                >
                  {stage.description}
                </p>
              </li>
            );
          })}
        </ol>
      </article>

      <article style={blockStyle}>
        <p style={eyebrowStyle}>CTA & Locks</p>
        <h4 style={titleStyle}>
          Submit button + field state
        </h4>
        <div style={formContainerStyle}>
          <div>
            <label style={formLabelStyle} htmlFor="preview-name">
              Name
            </label>
            <input
              id="preview-name"
              type="text"
              defaultValue={activeScenario?.fieldValues?.name ?? ''}
              readOnly={fieldProps.readOnly}
              disabled={fieldProps.disabled}
              data-debug={activeScenario?.fieldState}
              style={{
                width: '100%',
                borderRadius: 10,
                ...borders({
                  all: {
                    width: m(1),
                    color: 'rgba(245,240,255,0.25)',
                  },
                }),
                ...paddings({
                  vertical: m(10),
                  horizontal: m(12),
                }),
                ...backgrounds({
                  color: fieldProps.disabled
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(6,4,18,0.85)',
                }),
                color: '#f5f0ff',
                marginBottom: 12,
              }}
            />
          </div>
          <div>
            <label style={formLabelStyle} htmlFor="preview-email">
              Email
            </label>
            <input
              id="preview-email"
              type="email"
              defaultValue={activeScenario?.fieldValues?.email ?? ''}
              readOnly={fieldProps.readOnly}
              disabled={fieldProps.disabled}
              data-debug={activeScenario?.fieldState}
              style={{
                width: '100%',
                borderRadius: 10,
                ...borders({
                  all: {
                    width: m(1),
                    color: 'rgba(245,240,255,0.25)',
                  },
                }),
                ...paddings({
                  vertical: m(10),
                  horizontal: m(12),
                }),
                ...backgrounds({
                  color: fieldProps.disabled
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(6,4,18,0.85)',
                }),
                color: '#f5f0ff',
                marginBottom: 12,
              }}
            />
          </div>
          <div>
            <label style={formLabelStyle} htmlFor="preview-message">
              Message
            </label>
            <textarea
              id="preview-message"
              rows={4}
              defaultValue={activeScenario?.fieldValues?.message ?? ''}
              readOnly={fieldProps.readOnly}
              disabled={fieldProps.disabled}
              data-debug={activeScenario?.fieldState}
              style={{
                width: '100%',
                borderRadius: 10,
                ...borders({
                  all: {
                    width: m(1),
                    color: 'rgba(245,240,255,0.25)',
                  },
                }),
                ...paddings({
                  vertical: m(10),
                  horizontal: m(12),
                }),
                ...backgrounds({
                  color: fieldProps.disabled
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(6,4,18,0.85)',
                }),
                color: '#f5f0ff',
                resize: 'vertical',
              }}
            />
          </div>
          {activeScenario?.note ? (
            <p
              style={{
                fontSize: 14,
                color: 'rgba(245,240,255,0.75)',
                ...margins({
                  top: m(4),
                  horizontal: m(0),
                  bottom: m(0),
                }),
              }}
            >
              {activeScenario.note}
            </p>
          ) : null}
          <button
            type="button"
            disabled={
              activeScenario?.ctaState === 'disabled' ||
              activeScenario?.ctaState === 'success'
            }
            data-debug={activeScenario?.ctaState}
            style={{
              minHeight: glassyButtonTokens.size.css(),
              borderRadius: glassyButtonTokens.borders.radius.css(),
              ...borders(glassyButtonTokens.borders),
              ...backgrounds({
                color:
                  activeScenario?.ctaState === 'success'
                    ? 'rgba(77,201,173,0.2)'
                    : 'rgba(255,255,255,0.08)',
              }),
              color: glassyButtonTokens.text.color.css(),
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor:
                activeScenario?.ctaState === 'disabled' ||
                activeScenario?.ctaState === 'success'
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {activeScenario?.ctaState === 'busy' ? 'Sending…' : ctaLabel}
          </button>
        </div>
      </article>

      <article style={blockStyle}>
        <p style={eyebrowStyle}>Telemetry</p>
        <h4 style={titleStyle}>
          Console events & dimensions
        </h4>
        <p style={helperTextStyle}>
          Selecting a scenario above emits the same debug logs you&apos;ll see
          when the production form runs. Use these to confirm QA captures the
          right metrics before touching Brevo.
        </p>
        <ul style={listStyle}>
          {telemetryLegend.map((item) => (
            <li
              key={item.event}
              style={{
                ...accentListItemStyle,
                borderLeftColor: 'rgba(245,240,255,0.24)',
              }}
            >
              <code style={codeStyle}>{item.event}</code>
              <strong>{item.label}</strong>
              <p style={helperTextStyle}>
                {item.description}
              </p>
              <p style={helperTextStyle}>
                <span style={{ fontWeight: 600 }}>Dimensions:</span>{' '}
                {item.dimensions.join(', ')}
              </p>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
