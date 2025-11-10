'use client';

import { useMemo, useState } from 'react';
import { formTokens } from '@/tokens/forms.tokens';
import { glassyButtonTokens } from '@/tokens/glassy.tokens';
import * as debugFormStyles from '@/styles/components/debugForm.css';

type Tone = 'default' | 'info' | 'success' | 'warning' | 'error' | 'muted';

type TonePalette = Record<
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
};

type Props = {
  stages: readonly TimelineStage[];
  scenarios: readonly ResponseScenario[];
  tonePalette: TonePalette;
};

const formContainerStyle = {
  borderRadius: 18,
  border: '1px solid rgba(245,240,255,0.18)',
  padding: 24,
  backgroundColor: 'rgba(6,4,18,0.75)',
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

  return (
    <div className={debugFormStyles.stack}>
      <article className={debugFormStyles.block}>
        <p className={debugFormStyles.eyebrow}>Timeline</p>
        <h4 className={debugFormStyles.title}>
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
                  border: `1px solid ${palette.border}`,
                  padding: '8px 14px',
                  backgroundColor: isActive
                    ? palette.accent
                    : 'transparent',
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
        <ol className={debugFormStyles.list}>
          {stages.map((stage, index) => {
            const isActive =
              activeScenario?.stageIndex !== undefined &&
              index <= activeScenario.stageIndex;
            return (
              <li
                key={stage.id}
                className={debugFormStyles.accentListItem}
                style={{
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
                  className={debugFormStyles.helperText}
                  style={{ margin: 0 }}
                >
                  {stage.description}
                </p>
              </li>
            );
          })}
        </ol>
      </article>

      <article className={debugFormStyles.block}>
        <p className={debugFormStyles.eyebrow}>CTA & Locks</p>
        <h4 className={debugFormStyles.title}>
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
                border: '1px solid rgba(245,240,255,0.25)',
                padding: '10px 12px',
                backgroundColor: fieldProps.disabled
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(6,4,18,0.85)',
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
                border: '1px solid rgba(245,240,255,0.25)',
                padding: '10px 12px',
                backgroundColor: fieldProps.disabled
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(6,4,18,0.85)',
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
                border: '1px solid rgba(245,240,255,0.25)',
                padding: '10px 12px',
                backgroundColor: fieldProps.disabled
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(6,4,18,0.85)',
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
                margin: '4px 0 0',
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
              border: `1px solid ${glassyButtonTokens.borders.color.css()}`,
              backgroundColor:
                activeScenario?.ctaState === 'success'
                  ? 'rgba(77,201,173,0.2)'
                  : 'rgba(255,255,255,0.08)',
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
    </div>
  );
}
