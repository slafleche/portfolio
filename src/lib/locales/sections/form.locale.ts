import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

export const FORM_KEYS = {
  heading: 'form-heading',
  intro: 'form-intro',
  counterRemaining: 'form-counter-remaining',
  privacyText: 'form-privacy-text',
  privacyLinkLabel: 'form-privacy-link-label',
  submitLabel: 'form-submit-label',
  honeypotLabel: 'form-honeypot-label',
} as const satisfies Record<string, keyof Messages>;

export const FORM_LABEL_KEYS = {
  name: 'form-name-label',
  email: 'form-email-label',
  message: 'form-message-label',
} as const satisfies Record<string, keyof Messages>;

export const FORM_ERROR_KEYS = {
  name: {
    required: 'form-error-name-required',
    tooLong: 'form-error-name-too_long',
  },
  email: {
    invalid: 'form-error-email-invalid',
  },
  message: {
    required: 'form-error-message-required',
    tooLong: 'form-error-message-too_long',
    tooManyLinks: 'form-error-message-too_many_links',
  },
  token: {
    missing: 'form-error-token-missing',
  },
} as const satisfies Record<
  string,
  Record<string, keyof Messages>
>;

export const FORM_STATUS_CODES = [
  'success',
  'validation_error',
  'rate_limited',
  'service_unavailable',
  'not_configured',
  'blocked',
] as const;

export type FormServerStatusCode =
  (typeof FORM_STATUS_CODES)[number];

export const FORM_STATUS_KEYS = {
  sending: 'form-status-sending',
  success: 'form-status-success',
  generic: 'form-status-generic_error',
  validation_error: 'form-status-validation_error',
  rate_limited: 'form-status-rate_limited',
  service_unavailable: 'form-status-service_unavailable',
  not_configured: 'form-status-not_configured',
  blocked: 'form-status-blocked',
} as const satisfies Record<string, keyof Messages>;

export const FORM_ERROR_KEY_LIST = [
  FORM_ERROR_KEYS.name.required,
  FORM_ERROR_KEYS.name.tooLong,
  FORM_ERROR_KEYS.email.invalid,
  FORM_ERROR_KEYS.message.required,
  FORM_ERROR_KEYS.message.tooLong,
  FORM_ERROR_KEYS.message.tooManyLinks,
  FORM_ERROR_KEYS.token.missing,
] as const;

export type FormErrorKey =
  (typeof FORM_ERROR_KEY_LIST)[number];

export type FormStatusKey =
  keyof typeof FORM_STATUS_KEYS;

export type ContactFormCopy = {
  heading: string;
  intro: string;
  counterTemplate: string;
  submitLabel: string;
  privacy: {
    text: string;
    linkLabel: string;
  };
  labels: {
    name: string;
    email: string;
    message: string;
  };
  honeypotLabel: string;
  errors: {
    name: {
      required: string;
      tooLong: string;
    };
    email: {
      invalid: string;
    };
    message: {
      required: string;
      tooLong: string;
      tooManyLinks: string;
    };
    token: {
      missing: string;
    };
  };
  statuses: Record<FormStatusKey, string>;
};

export const buildContactFormCopy = (
  t: Translator,
): ContactFormCopy => ({
  heading: t(FORM_KEYS.heading),
  intro: t(FORM_KEYS.intro),
  counterTemplate: t(FORM_KEYS.counterRemaining),
  submitLabel: t(FORM_KEYS.submitLabel),
  privacy: {
    text: t(FORM_KEYS.privacyText),
    linkLabel: t(FORM_KEYS.privacyLinkLabel),
  },
  labels: {
    name: t(FORM_LABEL_KEYS.name),
    email: t(FORM_LABEL_KEYS.email),
    message: t(FORM_LABEL_KEYS.message),
  },
  honeypotLabel: t(FORM_KEYS.honeypotLabel),
  errors: {
    name: {
      required: t(FORM_ERROR_KEYS.name.required),
      tooLong: t(FORM_ERROR_KEYS.name.tooLong),
    },
    email: {
      invalid: t(FORM_ERROR_KEYS.email.invalid),
    },
    message: {
      required: t(FORM_ERROR_KEYS.message.required),
      tooLong: t(FORM_ERROR_KEYS.message.tooLong),
      tooManyLinks: t(FORM_ERROR_KEYS.message.tooManyLinks),
    },
    token: {
      missing: t(FORM_ERROR_KEYS.token.missing),
    },
  },
  statuses: Object.fromEntries(
    Object.entries(FORM_STATUS_KEYS).map(
      ([status, key]) => [status, t(key)],
    ),
  ) as Record<FormStatusKey, string>,
});
