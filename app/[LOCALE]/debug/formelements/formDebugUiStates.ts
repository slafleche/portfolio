import type { FormErrorKey } from '../../../../src/lib/locales/sections/form.locale';

export type FieldKey = 'name' | 'email' | 'message';

export type FieldSnapshot = {
  label: string;
  placeholder?: string;
  value?: string;
  helper?: string;
  error?: string;
  errorKey?: FormErrorKey;
  success?: string;
  badge?: string;
  notes?: readonly string[];
  dataDebug?: string;
  readOnly?: boolean;
  disabled?: boolean;
};

export type UiPermutationId =
  | 'default'
  | 'focus'
  | 'focusVisible'
  | 'hover'
  | 'autofill'
  | 'invalid'
  | 'brevoDomainRejected'
  | 'validEntry'
  | 'readonlyPending'
  | 'disabled';

export type UiPermutation = {
  id: UiPermutationId;
  label: string;
  description: string;
  formMode: 'editable' | 'readonly' | 'disabled';
  fields: Record<FieldKey, FieldSnapshot>;
  notes?: readonly string[];
};

const baseFieldLabels: Record<FieldKey, string> = {
  name: 'Name',
  email: 'Email',
  message: 'Message',
};

export const uiPermutations: readonly UiPermutation[] = [
  {
    id: 'default',
    label: 'Default (pristine)',
    description:
      'Initial state with empty fields and helper copy only.',
    formMode: 'editable',
    fields: {
      name: {
        label: baseFieldLabels.name,
        placeholder: 'Ada Lovelace',
        helper: 'Use your real name for the intro.',
      },
      email: {
        label: baseFieldLabels.email,
        placeholder: 'you@example.com',
        helper: 'We only use this to reply.',
      },
      message: {
        label: baseFieldLabels.message,
        placeholder: 'Tell me about your project…',
        helper: 'Min 40 characters · Max 1200 characters',
        notes: [
          'Character counter hidden until user types.',
        ],
      },
    },
  },
  {
    id: 'focus',
    label: 'Focus (pointer)',
    description:
      'Mouse/touch focus ring with helper text still visible.',
    formMode: 'editable',
    fields: {
      name: {
        label: baseFieldLabels.name,
        placeholder: 'Ada Someone',
        value: 'Ada',
        helper: 'Caret color matches accent border.',
        dataDebug: 'focus',
      },
      email: {
        label: baseFieldLabels.email,
        placeholder: 'you@example.com',
        value: 'ada@example.com',
        helper: 'Hover + focus ring stack correctly.',
        dataDebug: 'focus',
      },
      message: {
        label: baseFieldLabels.message,
        placeholder: 'Tell me about your project…',
        value:
          'Following up on our design system audit. Sharing context shortly.',
        helper: 'Floating label stays pinned while typing.',
        dataDebug: 'focus',
      },
    },
    notes: [
      'Use `data-debug="focus"` so designers can target the state.',
    ],
  },
  {
    id: 'focusVisible',
    label: 'Focus-visible (keyboard)',
    description:
      'Keyboard outline with increased contrast and offset.',
    formMode: 'editable',
    fields: {
      name: {
        label: baseFieldLabels.name,
        value: 'Keyboard Researcher',
        helper: 'Outline uses WCAG AAA contrast.',
        dataDebug: 'focus-visible',
      },
      email: {
        label: baseFieldLabels.email,
        value: 'keyboard@example.com',
        helper:
          'Focus ring must remain visible even if error badge shows.',
        dataDebug: 'focus-visible',
      },
      message: {
        label: baseFieldLabels.message,
        value:
          'Keyboard navigation should land on the submit CTA after the textarea.',
        helper: 'Caret + outline stack without clipping.',
        dataDebug: 'focus-visible',
      },
    },
    notes: [
      'Announce focus-visible via `:focus-visible` only—no JS toggles.',
    ],
  },
  {
    id: 'hover',
    label: 'Hover',
    description:
      'Lightweight hover accent for pointer users without focus.',
    formMode: 'editable',
    fields: {
      name: {
        label: baseFieldLabels.name,
        helper: 'Border + label tint only—no fill change.',
        dataDebug: 'hover',
      },
      email: {
        label: baseFieldLabels.email,
        helper: 'Hover rings must not conflict with autofill.',
        dataDebug: 'hover',
      },
      message: {
        label: baseFieldLabels.message,
        helper: 'Show how hover works on textarea chrome.',
        dataDebug: 'hover',
      },
    },
  },
  {
    id: 'autofill',
    label: 'Autofill',
    description:
      'Browser-supplied values with background + text overrides.',
    formMode: 'editable',
    fields: {
      name: {
        label: baseFieldLabels.name,
        value: 'Autofill Persona',
        helper: 'Shows tinted background + text color.',
        dataDebug: 'autofill',
        badge: 'Autofill',
      },
      email: {
        label: baseFieldLabels.email,
        value: 'autofill@example.com',
        helper:
          'Ensure text contrast stays accessible in dark themes.',
        dataDebug: 'autofill',
        badge: 'Autofill',
      },
      message: {
        label: baseFieldLabels.message,
        value:
          'Message restored via browser autofill so designers can test backgrounds.',
        helper: 'textarea uses same autofill tokens.',
        dataDebug: 'autofill',
        badge: 'Autofill',
      },
    },
    notes: [
      'Use `:-webkit-autofill` tokens so Storybook shots stay accurate.',
    ],
  },
  {
    id: 'invalid',
    label: 'Invalid (client-side)',
    description:
      'Client validation errors with inline messaging + aria links.',
    formMode: 'editable',
    fields: {
      name: {
        label: baseFieldLabels.name,
        value: 'A',
        error: 'Name must be at least 2 characters.',
        errorKey: 'form-error-name-required',
        helper: 'aria-describedby chains helper + error nodes.',
        dataDebug: 'invalid',
      },
      email: {
        label: baseFieldLabels.email,
        value: 'not-an-email',
        error: 'Enter a valid email address.',
        errorKey: 'form-error-email-invalid',
        dataDebug: 'invalid',
      },
      message: {
        label: baseFieldLabels.message,
        value: 'Too short',
        error: 'Message must be at least 40 characters.',
        errorKey: 'form-error-message-required',
        dataDebug: 'invalid',
      },
    },
    notes: [
      'Focus returns to the first invalid field after submit.',
    ],
  },
  {
    id: 'brevoDomainRejected',
    label: 'Brevo domain rejected',
    description:
      'Server-side response explaining an email domain block.',
    formMode: 'editable',
    fields: {
      name: {
        label: baseFieldLabels.name,
        value: 'Domain Tester',
      },
      email: {
        label: baseFieldLabels.email,
        value: 'example@example.com',
        error: 'Brevo rejected this domain. Try a different address.',
        errorKey: 'form-error-email-invalid',
        badge: 'Brevo response',
        dataDebug: 'brevo-domain-rejected',
        helper: 'Keep value so user can edit the domain.',
      },
      message: {
        label: baseFieldLabels.message,
        value:
          'This payload uses a blocked domain to preview the inline server error.',
      },
    },
    notes: [
      'CTA stays enabled so users can resubmit after fixing the domain.',
    ],
  },
  {
    id: 'validEntry',
    label: 'Valid entry',
    description:
      'All inputs pass validation and show success hints where relevant.',
    formMode: 'editable',
    fields: {
      name: {
        label: baseFieldLabels.name,
        value: 'Studio Tier One',
        success: 'Looks great.',
        dataDebug: 'valid',
      },
      email: {
        label: baseFieldLabels.email,
        value: 'example@example.com',
        success: 'We will reply here.',
        dataDebug: 'valid',
      },
      message: {
        label: baseFieldLabels.message,
        value:
          'Here is a fully valid payload to preview the pre-submit state before sending.',
        helper: 'Counter shows remaining characters.',
        dataDebug: 'valid',
      },
    },
  },
  {
    id: 'readonlyPending',
    label: 'Readonly (pending submit)',
    description: 'Form locks inputs while awaiting the API response.',
    formMode: 'readonly',
    fields: {
      name: {
        label: baseFieldLabels.name,
        value: 'Pending Sender',
        helper: 'readonly attribute only; no disabled styles.',
        readOnly: true,
        dataDebug: 'readonly',
      },
      email: {
        label: baseFieldLabels.email,
        value: 'pending@example.com',
        helper: 'Use spinner on CTA instead of disabling fields.',
        readOnly: true,
        dataDebug: 'readonly',
      },
      message: {
        label: baseFieldLabels.message,
        value:
          'Message body is locked until we hear back from the API.',
        readOnly: true,
        helper: 'Auto-resize still works while readonly.',
        dataDebug: 'readonly',
      },
    },
    notes: [
      'CTA shows loading indicator; aria-live announces “Sending”.',
    ],
  },
  {
    id: 'disabled',
    label: 'Disabled',
    description:
      'Entire form disabled (e.g., environment not configured).',
    formMode: 'disabled',
    fields: {
      name: {
        label: baseFieldLabels.name,
        value: 'Disabled state',
        helper: 'Muted palette for backgrounds + labels.',
        disabled: true,
        dataDebug: 'disabled',
      },
      email: {
        label: baseFieldLabels.email,
        value: 'disabled@example.com',
        disabled: true,
        dataDebug: 'disabled',
      },
      message: {
        label: baseFieldLabels.message,
        value: 'Message control disabled for maintenance.',
        disabled: true,
        helper: 'textarea uses same disabled tokens.',
        dataDebug: 'disabled',
      },
    },
    notes: [
      'CTA must also disable + announce via aria-live when this state mounts.',
    ],
  },
] as const;
