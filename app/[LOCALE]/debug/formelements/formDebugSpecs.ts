import type { ApiScenarioId } from './formDebugApiScenarios';
import type {
  FieldKey,
  UiPermutationId,
} from './formDebugUiStates';

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
};

export const debugCardSpecs: readonly DebugCardSpec[] = [
  {
    id: 'ui-default',
    title: 'UI — Default',
    description: 'Pristine fields right after the dialog opens.',
    ui: { global: 'default' },
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
    description:
      'Browser autofill palette across every control.',
    ui: { global: 'autofill' },
  },
  {
    id: 'ui-invalid',
    title: 'UI — Invalid (client)',
    description:
      'Client-side errors before hitting the API route.',
    ui: { global: 'invalid' },
  },
  {
    id: 'ui-brevo-domain',
    title: 'UI — Brevo domain rejected',
    description:
      'Server-driven domain rejection on the email field.',
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
  },
  {
    id: 'api-success',
    title: 'API — Success (2xx)',
    description: 'Success banner + locked CTA.',
    apiScenarioId: 'success',
    ui: { global: 'validEntry' },
  },
  {
    id: 'api-validation-error',
    title: 'API — Validation error',
    description:
      'Server validation failed; focus returns to first error.',
    apiScenarioId: 'validation_error',
    ui: { global: 'invalid' },
  },
  {
    id: 'api-rate-limited',
    title: 'API — Rate limited',
    description: 'Cooldown timer disables CTA + inputs.',
    apiScenarioId: 'rate_limited',
    ui: { global: 'readonlyPending' },
  },
  {
    id: 'api-service-down',
    title: 'API — Service unavailable',
    description:
      'Outage banner plus readonly fields awaiting retry.',
    apiScenarioId: 'service_unavailable',
    ui: { global: 'readonlyPending' },
  },
  {
    id: 'api-blocked',
    title: 'API — Blocked (honeypot)',
    description:
      'Pretend success while inputs stay disabled for bots.',
    apiScenarioId: 'blocked',
    ui: { global: 'disabled' },
    revealHoneypot: true,
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
  },
  {
    id: 'api-generic-error',
    title: 'API — Generic error',
    description:
      'Unknown failure with retry CTA and editable inputs.',
    apiScenarioId: 'generic_error',
    ui: { global: 'validEntry' },
  },
  {
    id: 'api-not-configured',
    title: 'API — Not configured',
    description:
      'Environment missing Brevo keys; disable entire form.',
    apiScenarioId: 'not_configured',
    ui: { global: 'disabled' },
  },
] as const;
