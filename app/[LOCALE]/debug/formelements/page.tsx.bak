import type { CSSProperties } from 'react';
import { resolveLocale } from '@/lib/locales/locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import {
  buildContactFormCopy,
  type FormErrorKey,
} from '@/lib/locales/sections/form.locale';
import type {
  ContactFormDebugFieldState,
  ContactFormDebugState,
} from '@/components/contact/ContactForm';
import type { ContactFormToastDebugScenario } from '@/components/contact/contact.types';
import type { ContactFormResponse } from '@/modules/contactForm/mockSubmit';
import {
  buildPrivacyCopy,
} from '@/lib/locales/sections/privacy.locale';
import type {
  ContactFormDraft,
  FieldErrorMap,
} from '@/modules/contactForm/validation';
import {
  uiPermutations,
  type FieldKey,
  type FieldSnapshot,
  type UiPermutation,
  type UiPermutationId,
} from './formDebugUiStates';
import {
  apiScenarios,
  type ApiScenario,
} from './formDebugApiScenarios';
import {
  debugCardSpecs,
  type DebugCardSpec,
} from './formDebugSpecs';
import ContactFormPreview from './ContactFormPreview';
import SubmissionTimelineSection, {
  type TimelineStage,
  type ResponseScenario as TimelineResponseScenario,
  type TonePalette as TimelineTonePalette,
  type TimelineTelemetryDescriptor,
  type Tone as TimelineTone,
} from './SubmissionTimelineSection';

type FormMode = 'editable' | 'readonly' | 'disabled';

type ResolvedCard = {
  spec: DebugCardSpec;
  uiPermutation: UiPermutation;
  fields: Record<FieldKey, FieldSnapshot>;
  formMode: FormMode;
  apiScenario?: ApiScenario;
  turnstileSimulation?: 'missing' | 'expired';
};

const fieldOrder: readonly FieldKey[] = [
  'name',
  'email',
  'message',
] as const;

const uiPermutationMap = new Map(
  uiPermutations.map((permutation) => [permutation.id, permutation]),
);

const apiScenarioMap = new Map(
  apiScenarios.map((scenario) => [scenario.id, scenario]),
);

const payloadStyle: CSSProperties = {
  backgroundColor: 'rgba(8,6,16,0.6)',
  borderRadius: 16,
  border: '1px solid rgba(245,240,255,0.12)',
  padding: 16,
  fontFamily:
    '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  fontSize: 12,
  lineHeight: 1.5,
  overflowX: 'auto',
};

const sectionHeadingStyle: CSSProperties = {
  fontSize: 34,
  margin: '0 0 12px',
};

const sectionIntroStyle: CSSProperties = {
  margin: '0 0 32px',
  fontSize: 18,
  lineHeight: 1.6,
  color: 'rgba(245,240,255,0.8)',
};

const cardStyle: CSSProperties = {
  borderRadius: 24,
  border: '1px solid rgba(245,240,255,0.15)',
  padding: 32,
  backgroundColor: 'rgba(8,6,16,0.75)',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const metaGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 16,
};

const detailListStyle: CSSProperties = {
  margin: '4px 0 0',
  paddingLeft: 18,
  fontSize: 14,
  lineHeight: 1.5,
};

const timelineStages: readonly TimelineStage[] = [
  {
    id: 'build',
    label: 'Build payload',
    description:
      'User fills the form, validation runs locally, and we craft the POST body.',
  },
  {
    id: 'guards',
    label: 'Guards & anti-abuse',
    description:
      'Honeypot, Turnstile, and configuration checks block bad actors before hitting Brevo.',
  },
  {
    id: 'post',
    label: 'POST /api/contact',
    description:
      'Form locks while we call the API route and enqueue telemetry timers.',
  },
  {
    id: 'response',
    label: 'Response & messaging',
    description:
      'Brevo responds, inline banners/toasts update, and focus shifts for announcements.',
  },
] as const;

const stageIndexMap = new Map(
  timelineStages.map((stage, index) => [stage.id, index]),
);

const timelineTonePalette: TimelineTonePalette = {
  default: {
    border: 'rgba(245,240,255,0.2)',
    bg: 'rgba(245,240,255,0.05)',
    accent: '#f5f0ff',
    text: '#f5f0ff',
  },
  info: {
    border: 'rgba(122,186,255,0.4)',
    bg: 'rgba(16,52,92,0.45)',
    accent: '#7abaff',
    text: '#c5e1ff',
  },
  success: {
    border: 'rgba(77,201,173,0.45)',
    bg: 'rgba(8,48,38,0.6)',
    accent: '#4dc9ad',
    text: '#a8f4de',
  },
  warning: {
    border: 'rgba(255,209,128,0.45)',
    bg: 'rgba(57,36,6,0.65)',
    accent: '#ffd180',
    text: '#ffe8c2',
  },
  error: {
    border: 'rgba(255,132,154,0.45)',
    bg: 'rgba(60,14,24,0.65)',
    accent: '#ff849a',
    text: '#ffd2db',
  },
  muted: {
    border: 'rgba(168,167,196,0.35)',
    bg: 'rgba(36,32,52,0.6)',
    accent: '#a8a7c4',
    text: '#d6d3eb',
  },
};

const telemetryLegend: readonly TimelineTelemetryDescriptor[] = [
  {
    event: 'contact.submit.start',
    label: 'start',
    description:
      'Fires once validation passes and we begin POSTing to `/api/contact`.',
    dimensions: [
      'payload snapshot (name, email, message length)',
      'tokenPresent',
      'hpFilled',
    ],
  },
  {
    event: 'contact.submit.validation_error',
    label: 'validation_error',
    description:
      'Client-side validation failed; includes the invalid fields map.',
    dimensions: ['invalidFields', 'errorMap'],
  },
  {
    event: 'contact.submit.blocked',
    label: 'blocked',
    description:
      'Honeypot or Turnstile guard tripped; payload is logged without sending.',
    dimensions: ['hpFilled', 'tokenPresent', 'locale'],
  },
  {
    event: 'contact.submit.success',
    label: 'success',
    description:
      'Brevo accepted the message; mirrors the celebratory panel and timers.',
    dimensions: ['durationMs', 'submissionId', 'ipHash'],
  },
  {
    event: 'contact.submit.rate_limited',
    label: 'rate_limited',
    description:
      'Too many submissions from the same IP; CTA disables with retry info.',
    dimensions: ['ipHash', 'cooldownSeconds'],
  },
  {
    event: 'contact.submit.service_unavailable',
    label: 'service_unavailable',
    description:
      'Brevo or the network failed; includes HTTP status and retry metadata.',
    dimensions: ['status', 'retryAfterSeconds'],
  },
  {
    event: 'contact.submit.generic_error',
    label: 'generic_error',
    description:
      'Unexpected exception bubbled up; inspect the error message/stack.',
    dimensions: ['error.message', 'error.stack'],
  },
  {
    event: 'contact.submit.not_configured',
    label: 'not_configured',
    description:
      'Environment variables are missing; exposes which secrets are absent.',
    dimensions: ['missingEnv'],
  },
] as const;

const toneByBannerTone: Record<string, TimelineTone> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  muted: 'muted',
};

const scenarioEventFallback: Partial<Record<ApiScenario['id'], string>> = {
  sending: 'contact.submit.start',
  success: 'contact.submit.success',
  validation_error: 'contact.submit.validation_error',
  rate_limited: 'contact.submit.rate_limited',
  service_unavailable: 'contact.submit.service_unavailable',
  blocked: 'contact.submit.blocked',
  generic_error: 'contact.submit.generic_error',
  not_configured: 'contact.submit.not_configured',
};

const deriveCtaState = (
  scenario: ApiScenario,
): TimelineResponseScenario['ctaState'] => {
  if (scenario.status === 'success') {
    return 'success';
  }
  if (scenario.cta.loading) {
    return 'busy';
  }
  if (scenario.status === 'validation_error' || scenario.status === 'generic') {
    return 'error';
  }
  if (scenario.cta.disabled) {
    return 'disabled';
  }
  return 'idle';
};

const extractTelemetryEvents = (scenario: ApiScenario): string[] => {
  const events = scenario.telemetry
    .filter((entry) => entry.startsWith('log event:'))
    .map((entry) => entry.replace('log event:', '').trim());
  if (events.length > 0) {
    return events;
  }
  const fallback = scenarioEventFallback[scenario.id];
  return fallback ? [fallback] : [];
};

const timelineScenarios: readonly TimelineResponseScenario[] =
  apiScenarios.map((scenario) => ({
    id: scenario.id,
    label: scenario.label,
    description: scenario.description,
    stageIndex: stageIndexMap.get(scenario.timelineStage) ?? 0,
    tone: toneByBannerTone[scenario.banner.tone] ?? 'default',
    note: scenario.focusManagement,
    ctaState: deriveCtaState(scenario),
    ctaLabel: scenario.cta.label,
    fieldState: scenario.fieldMode,
    fieldValues: {
      name: scenario.payload.name,
      email: scenario.payload.email,
      message: scenario.payload.message,
    },
    telemetryEvents: extractTelemetryEvents(scenario),
  }));

const defaultFormValues: ContactFormDraft = {
  name: '',
  email: '',
  message: '',
  token: 'mock-turnstile-token',
  hp: '',
};

const fallbackErrorKeys: Record<FieldKey, FormErrorKey> = {
  name: 'form-error-name-required',
  email: 'form-error-email-invalid',
  message: 'form-error-message-required',
};

const cloneFieldSnapshot = (
  snapshot: FieldSnapshot,
): FieldSnapshot => ({
  ...snapshot,
  notes: snapshot.notes ? [...snapshot.notes] : undefined,
});

const cloneFields = (
  fields: Record<FieldKey, FieldSnapshot>,
): Record<FieldKey, FieldSnapshot> => ({
  name: cloneFieldSnapshot(fields.name),
  email: cloneFieldSnapshot(fields.email),
  message: cloneFieldSnapshot(fields.message),
});

const cloneScenario = (
  scenario: ApiScenario | undefined,
  locale: string,
): ApiScenario | undefined => {
  if (!scenario) return undefined;
  return {
    ...scenario,
    banner: { ...scenario.banner },
    cta: { ...scenario.cta },
    payload: {
      ...scenario.payload,
      locale,
      metadata: {
        ...scenario.payload.metadata,
        timestamp: new Date().toISOString(),
      },
    },
    accessibilityNotes: [...scenario.accessibilityNotes],
    telemetry: [...scenario.telemetry],
  };
};

const getUiPermutation = (
  id?: UiPermutationId,
): UiPermutation =>
  uiPermutationMap.get(id ?? 'default') ??
  uiPermutations[0];

const resolveCard = (
  spec: DebugCardSpec,
  locale: string,
): ResolvedCard => {
  const baseUi = getUiPermutation(spec.ui?.global);
  const fields = cloneFields(baseUi.fields);

  if (spec.ui?.overrides) {
    Object.entries(spec.ui.overrides).forEach(
      ([fieldKey, permutationId]) => {
        if (!permutationId) return;
        const override = getUiPermutation(permutationId);
        fields[fieldKey as FieldKey] = cloneFieldSnapshot(
          override.fields[fieldKey as FieldKey],
        );
      },
    );
  }

  const scenarioId = spec.apiScenarioId;
  const scenario = scenarioId
    ? cloneScenario(apiScenarioMap.get(scenarioId), locale)
    : undefined;

  const formMode: FormMode =
    scenario?.fieldMode ?? baseUi.formMode;

  return {
    spec,
    uiPermutation: baseUi,
    fields,
    formMode,
    apiScenario: scenario,
    turnstileSimulation: spec.turnstileSimulation,
  };
};

const resolveCards = (
  locale: string,
): ResolvedCard[] =>
  debugCardSpecs.map((spec) => resolveCard(spec, locale));

const buildDebugState = (
  card: ResolvedCard,
): ContactFormDebugState => {
  const values: ContactFormDraft = {
    ...defaultFormValues,
    name: card.fields.name.value ?? defaultFormValues.name,
    email: card.fields.email.value ?? defaultFormValues.email,
    message: card.fields.message.value ?? defaultFormValues.message,
  };

  const fieldErrors: FieldErrorMap = {};
  const inlineErrors: Partial<Record<FieldKey, string>> = {};
  const inlineHelpers: Partial<Record<FieldKey, string>> = {};
  const fieldStates: Partial<
    Record<FieldKey, ContactFormDebugFieldState>
  > = {};

  fieldOrder.forEach((fieldKey) => {
    const snapshot = card.fields[fieldKey];
    if (snapshot.error) {
      inlineErrors[fieldKey] = snapshot.error;
      fieldErrors[fieldKey] =
        snapshot.errorKey ?? fallbackErrorKeys[fieldKey];
    }
    if (
      snapshot.readOnly ||
      snapshot.disabled ||
      snapshot.dataDebug
    ) {
      fieldStates[fieldKey] = {
        readOnly: snapshot.readOnly ?? undefined,
        disabled: snapshot.disabled ?? undefined,
        dataDebug: snapshot.dataDebug,
      };
    }
    if (snapshot.helper) {
      inlineHelpers[fieldKey] = snapshot.helper;
    }
  });

  if (
    card.formMode === 'readonly' ||
    card.formMode === 'disabled'
  ) {
    fieldOrder.forEach((fieldKey) => {
      fieldStates[fieldKey] = {
        readOnly:
          fieldStates[fieldKey]?.readOnly ??
          (card.formMode === 'readonly'),
        disabled:
          fieldStates[fieldKey]?.disabled ??
          (card.formMode === 'disabled'),
        dataDebug: fieldStates[fieldKey]?.dataDebug,
      };
    });
  }

  const scenario = card.apiScenario;
  let statusState: ContactFormDebugState['statusState'];
  let responseSimulation: ContactFormResponse | undefined;
  if (scenario) {
    values.name = scenario.payload.name;
    values.email = scenario.payload.email;
    values.message = scenario.payload.message;
    values.hp = scenario.payload.hp;
    values.token = scenario.payload.token;

    if (scenario.id === 'sending') {
      statusState = { status: 'sending' };
    } else {
      const responseCode = scenario.id as ContactFormResponse['code'];
      responseSimulation = {
        ok: responseCode === 'success',
        code: responseCode,
        message: scenario.banner.body,
      };
    }
  }

  if (card.spec.statusState) {
    statusState = card.spec.statusState;
  }

  const hasErrors = Object.keys(fieldErrors).length > 0;

  const normalizedFieldStates =
    Object.keys(fieldStates).length > 0 ? fieldStates : undefined;

  const ctaEnabled =
    scenario?.cta.disabled === false || (!scenario && card.formMode === 'editable');
  const showSubmitOverlay =
    card.spec.showSubmitOverlay !== undefined
      ? card.spec.showSubmitOverlay
      : ctaEnabled;

  return {
    values,
    fieldErrors,
    inlineErrors,
    inlineHelpers,
    statusState,
    responseSimulation,
    isSubmitting:
      scenario?.status === 'sending' ||
      Boolean(scenario?.cta.loading),
    hasAttemptedSubmit: scenario ? true : hasErrors,
    fieldStates: normalizedFieldStates,
    revealHoneypot: Boolean(card.spec.revealHoneypot),
    logFocusEvents: Boolean(card.spec.logFocus),
    showSubmitOverlay,
    scrollStatusIntoView: false,
    enableTelemetryLogs: true,
    turnstileSimulation: card.turnstileSimulation,
  };
};

type ApiDetailsProps = {
  scenario: ApiScenario;
};

function ApiDetails({ scenario }: ApiDetailsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
      }}
    >
      <div>
        <h4>Payload preview</h4>
        <pre style={payloadStyle}>
          {JSON.stringify(scenario.payload, null, 2)}
        </pre>
      </div>
      <div>
        <h4>Accessibility</h4>
        <ul style={detailListStyle}>
          {scenario.accessibilityNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <h4 style={{ marginTop: 16 }}>Focus management</h4>
        <p style={{ margin: '4px 0 12px', lineHeight: 1.5 }}>
          {scenario.focusManagement}
        </p>
        <h4>Telemetry</h4>
        <ul style={detailListStyle}>
          {scenario.telemetry.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type CardMetaProps = {
  card: ResolvedCard;
};

function CardMeta({ card }: CardMetaProps) {
  const overrides = card.spec.ui?.overrides;
  return (
    <div id={`${card.spec.id}-meta`} style={metaGridStyle}>
      <div>
        <strong>UI base</strong>
        <p style={{ margin: '4px 0 0' }}>{card.uiPermutation.label}</p>
      </div>
      {card.apiScenario ? (
        <div>
          <strong>API scenario</strong>
          <p style={{ margin: '4px 0 0' }}>
            {card.apiScenario.label}
          </p>
        </div>
      ) : null}
      {overrides && Object.keys(overrides).length ? (
        <div>
          <strong>Field overrides</strong>
          <ul style={detailListStyle}>
            {Object.entries(overrides).map(([field, id]) => (
              <li key={`${card.spec.id}-${field}-${id}`}>
                {field}: {getUiPermutation(id)?.label ?? id}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {card.uiPermutation.notes?.length ? (
        <div>
          <strong>UI notes</strong>
          <ul style={detailListStyle}>
            {card.uiPermutation.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {(card.spec.info?.length || card.spec.logFocus) ? (
        <div>
          <strong>Debug info</strong>
          <ul style={detailListStyle}>
            {card.spec.info?.map((note) => (
              <li key={note}>{note}</li>
            ))}
            {card.spec.logFocus ? (
              <li>
                Focus logs emit to the console as
                {' '}
                <code>[ContactForm][debug]</code>
                . Use “Test submit” to trigger them.
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default async function FormElementsDebugPage({
  params,
}: {
  params: Promise<{ LOCALE: string }>;
}) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const translator = await loadTranslator(locale);
  const contactFormCopy = buildContactFormCopy(translator);
  const privacyCopy = buildPrivacyCopy(translator);
  const cards = resolveCards(locale);

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '64px 24px 96px',
        backgroundColor: '#07050e',
        color: '#f5f0ff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        <header>
          <p
            style={{
              textTransform: 'uppercase',
              letterSpacing: 4,
              fontSize: 12,
              color: 'rgba(245,240,255,0.6)',
              marginBottom: 12,
            }}
          >
            /{locale}/debug/formelements
          </p>
          <h1 style={{ fontSize: 48, margin: '0 0 16px' }}>
            Contact Form — Debug Matrix
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 780 }}>
            Every UI permutation and Brevo response lives here. These cards
            render the production markup with static data so designers can lift
            styles into Storybook while engineers keep the payload contract in
            sync with `/api/contact`.
          </p>
        </header>

        <SubmissionTimelineSection
          stages={timelineStages}
          scenarios={timelineScenarios}
          tonePalette={timelineTonePalette}
          telemetryLegend={telemetryLegend}
        />

        <section>
          <h2 style={sectionHeadingStyle}>Preview Gallery</h2>
          <p style={sectionIntroStyle}>
            Cards below combine the UI permutations and API scenarios defined in
            <code> formDebugSpecs.ts</code>. Each one surfaces the form markup,
            payload snapshot, accessibility notes, and telemetry we expect to
            ship.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 24,
            }}
          >
            {cards.map((card) => {
              const debugState = buildDebugState(card);
              const toastScenario: ContactFormToastDebugScenario | undefined =
                card.spec.toastScenarioId &&
                card.spec.toastScenarioId !== 'success' &&
                card.spec.toastScenarioId !== 'sending'
                  ? card.spec.toastScenarioId
                  : undefined;
              return (
                <article key={card.spec.id} style={cardStyle}>
                  <div>
                    <h3 style={{ margin: '0 0 8px' }}>
                      {card.spec.title}
                    </h3>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>
                      {card.spec.description}
                    </p>
                  </div>

                  <ContactFormPreview
                    copy={contactFormCopy}
                    privacyCopy={privacyCopy}
                    debugState={debugState}
                    locale={locale}
                    toastDebugScenario={toastScenario}
                  />

                  <CardMeta card={card} />

                  {card.apiScenario ? (
                    <ApiDetails scenario={card.apiScenario} />
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
