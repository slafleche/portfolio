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

type FormMode = 'editable' | 'readonly' | 'disabled';

type ResolvedCard = {
  spec: DebugCardSpec;
  uiPermutation: UiPermutation;
  fields: Record<FieldKey, FieldSnapshot>;
  formMode: FormMode;
  apiScenario?: ApiScenario;
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
  if (scenario) {
    values.name = scenario.payload.name;
    values.email = scenario.payload.email;
    values.message = scenario.payload.message;
    values.hp = scenario.payload.hp;
    values.token = scenario.payload.token;
  }

  const hasErrors = Object.keys(fieldErrors).length > 0;

  const buttonDisabled =
    scenario?.cta.disabled ??
    (card.formMode === 'disabled' ||
      card.formMode === 'readonly');

  const buttonDataDebug =
    scenario?.fieldMode === 'disabled' || card.formMode === 'disabled'
      ? 'disabled'
      : card.formMode === 'readonly'
        ? 'readonly'
        : undefined;

  const buttonAriaBusy =
    scenario?.cta.loading ??
    (scenario?.status === 'sending' ||
      (card.formMode === 'readonly' && !scenario));

  const normalizedFieldStates =
    Object.keys(fieldStates).length > 0 ? fieldStates : undefined;

  return {
    values,
    fieldErrors,
    inlineErrors,
    status: scenario?.status ?? null,
    statusMessage: scenario
      ? `${scenario.banner.title} — ${scenario.banner.body}`
      : undefined,
    isSubmitting:
      scenario?.status === 'sending' ||
      Boolean(scenario?.cta.loading),
    hasAttemptedSubmit: scenario ? true : hasErrors,
    fieldStates: normalizedFieldStates,
    button: {
      label: scenario?.cta.label,
      disabled: buttonDisabled,
      dataDebug: buttonDataDebug,
      ariaBusy: buttonAriaBusy,
    },
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
                    locale={locale}
                    debugState={debugState}
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
