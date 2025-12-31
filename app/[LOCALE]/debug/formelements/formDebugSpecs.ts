import type { ApiScenarioId } from './formDebugApiScenarios';
import type { FieldKey, UiPermutationId } from './formDebugUiStates';
import type { FormStatusKey } from '@/lib/locales/sections/form.locale';

// Each card in the debug gallery composes a UI permutation (focus, hover, etc.)
// with an optional API scenario (success, rate_limited, etc.). The renderer
// looks at this list, hydrates the correct ContactForm state, and surfaces the
// payload/banners/notes without hardcoding any permutations in the component.

export type DebugCardSpec = {
  id: string;
  title: string;
  description: string;
  apiScenarioId?: ApiScenarioId;
  ui?: {
    global?: UiPermutationId;
    overrides?: Partial<Record<FieldKey, UiPermutationId>>;
  };
  revealHoneypot?: boolean;
  logFocus?: boolean;
  showSubmitOverlay?: boolean;
  info?: readonly string[];
  turnstileSimulation?: 'missing' | 'expired';
  statusState?: {
    status: FormStatusKey;
    message?: string;
  };
  messageCentreScenarioId?: ApiScenarioId;
};

export const debugCardSpecs: readonly DebugCardSpec[] = [
  {
    id: 'ui-default',
    title: 'UI — Default',
    description: 'Pristine fields right after the dialog opens.',
    ui: { global: 'default' },
    showSubmitOverlay: true,
  },
  {
    id: 'ui-success-panel',
    title: 'UI — Success panel',
    description:
      'Locks the success view for styling/screenshots without submitting.',
    ui: { global: 'validEntry' },
    statusState: { status: 'success' },
    info: [
      'Forces the celebratory panel without hitting the API.',
    ],
  },
  {
    id: 'ui-focus',
    title: 'UI — Focus',
    description: 'Pointer focus styles on every control.',
    ui: { global: 'focus' },
  },
  {
    id: 'ui-focus-visible',
    title: 'UI — Focus-visible',
    description: 'Keyboard outline / :focus-visible styling.',
    ui: { global: 'focusVisible' },
  },
  {
    id: 'ui-hover',
    title: 'UI — Hover',
    description: 'Hover-only accents without focusing inputs.',
    ui: { global: 'hover' },
  },
  {
    id: 'ui-autofill',
    title: 'UI — Autofill',
    description: 'Browser autofill palette across every control.',
    ui: { global: 'autofill' },
  },
  {
    id: 'ui-invalid',
    title: 'UI — Invalid (client)',
    description: 'Client-side errors before hitting the API route.',
    ui: { global: 'invalid' },
  },
  {
    id: 'ui-brevo-domain',
    title: 'UI — Brevo domain rejected',
    description: 'Server-driven domain rejection on the email field.',
    ui: {
      global: 'validEntry',
      overrides: {
        email: 'brevoDomainRejected',
      },
    },
  },
  {
    id: 'ui-valid',
    title: 'UI — Valid entry',
    description:
      'All controls show the success affordances pre-submit.',
    ui: { global: 'validEntry' },
    showSubmitOverlay: true,
  },
  {
    id: 'ui-turnstile-missing',
    title: 'UI — Turnstile pending',
    description:
      'Human verification required before enabling the CTA.',
    ui: { global: 'validEntry' },
    turnstileSimulation: 'missing',
    info: [
      'Button stays disabled until Turnstile resolves.',
    ],
  },
  {
    id: 'ui-turnstile-expired',
    title: 'UI — Turnstile expired',
    description:
      'Challenge expired and needs a retry, showing helper copy.',
    ui: { global: 'validEntry' },
    turnstileSimulation: 'expired',
    info: [
      'Displays the retry affordance + warning copy.',
    ],
  },
  {
    id: 'ui-readonly',
    title: 'UI — Readonly pending',
    description:
      'Form locks inputs via `readOnly` while awaiting response.',
    ui: { global: 'readonlyPending' },
  },
  {
    id: 'ui-disabled',
    title: 'UI — Disabled',
    description:
      'Full-form disabled styling when service is offline.',
    ui: { global: 'disabled' },
  },
  {
    id: 'api-sending',
    title: 'API — Sending state',
    description: 'POST in flight; CTA shows loading state.',
    apiScenarioId: 'sending',
    ui: { global: 'readonlyPending' },
    showSubmitOverlay: true,
  },
  {
    id: 'api-success',
    title: 'API — Success (2xx)',
    description: 'Success banner + locked CTA.',
    apiScenarioId: 'success',
    ui: { global: 'validEntry' },
    logFocus: true,
    showSubmitOverlay: true,
  },
  {
    id: 'api-validation-error',
    title: 'API — Validation error',
    description:
      'Server validation failed; focus returns to first error.',
    apiScenarioId: 'validation_error',
    ui: { global: 'invalid' },
    logFocus: true,
    showSubmitOverlay: true,
    messageCentreScenarioId: 'validation_error',
  },
  {
    id: 'api-rate-limited',
    title: 'API — Rate limited',
    description: 'Cooldown timer disables CTA + inputs.',
    apiScenarioId: 'rate_limited',
    ui: { global: 'readonlyPending' },
    showSubmitOverlay: true,
    messageCentreScenarioId: 'rate_limited',
  },
  {
    id: 'api-service-down',
    title: 'API — Service unavailable',
    description: 'Outage banner plus readonly fields awaiting retry.',
    apiScenarioId: 'service_unavailable',
    ui: { global: 'readonlyPending' },
    showSubmitOverlay: true,
    messageCentreScenarioId: 'service_unavailable',
  },
  {
    id: 'api-blocked',
    title: 'API — Blocked (honeypot)',
    description:
      'Pretend success while inputs stay disabled for bots.',
    apiScenarioId: 'blocked',
    ui: { global: 'disabled' },
    revealHoneypot: true,
    messageCentreScenarioId: 'blocked',
  },
  {
    id: 'api-blocked-focus-visible',
    title: 'API — Blocked + focus-visible',
    description:
      'Show blocked scenario while highlighting keyboard outline on name field.',
    apiScenarioId: 'blocked',
    ui: {
      global: 'disabled',
      overrides: {
        name: 'focusVisible',
      },
    },
    revealHoneypot: true,
    messageCentreScenarioId: 'blocked',
  },
  {
    id: 'api-generic-error',
    title: 'API — Generic error',
    description:
      'Unknown failure with retry CTA and editable inputs.',
    apiScenarioId: 'generic_error',
    ui: { global: 'validEntry' },
    showSubmitOverlay: true,
    messageCentreScenarioId: 'generic_error',
  },
  {
    id: 'api-not-configured',
    title: 'API — Not configured',
    description:
      'Environment missing Brevo keys; disable entire form.',
    apiScenarioId: 'not_configured',
    ui: { global: 'disabled' },
    info: [
      'Shows new localized copy for the not-configured state.',
    ],
    messageCentreScenarioId: 'not_configured',
  },
] as const;
