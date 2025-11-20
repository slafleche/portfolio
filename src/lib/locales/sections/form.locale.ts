import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';
import { formTokens } from '@/tokens/forms.tokens';
import {
  buildFormBlockLocales,
  type FormBlockLocales,
} from '@/lib/locales/form/form.locale';

export const FORM_KEYS = {
  heading: 'form-heading',
  successBody: 'form-success-body',
  requiredIndicator: 'form-required-indicator',
  privacyText: 'form-privacy-text',
  privacyLinkLabel: 'form-privacy-link-label',
  privacyCloseLabel: 'form-privacy-close-label',
  submitLabel: 'form-submit-label',
  honeypotLabel: 'form-honeypot-label',
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
    tooShort: 'form-error-message-too_short',
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
  FORM_ERROR_KEYS.message.tooShort,
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
  successBody: string;
  requiredIndicator: string;
  submitLabel: string;
  privacy: {
    text: string;
    linkLabel: string;
    closeLabel: string;
  };
  honeypotLabel: string;
  turnstile: {
    loading: string;
    ready: string;
    verified: string;
    expired: string;
    error: string;
    disabled: string;
    buttonPending: string;
    buttonError: string;
    preview: string;
  };
  errors: {
    token: {
      missing: string;
    };
  };
  statuses: Record<FormStatusKey, string>;
  rateLimitedCountdown: string;
  blocks: FormBlockLocales;
};

export const buildContactFormCopy = (
  t: Translator,
): ContactFormCopy => {
  const seconds = formTokens.rateLimit.windowSeconds.toString();
  const withSeconds = (value: string) =>
    value.includes('{seconds}')
      ? value.replace('{seconds}', seconds)
      : value;
  return {
    heading: t(FORM_KEYS.heading),
    successBody: t(FORM_KEYS.successBody),
    requiredIndicator: t(FORM_KEYS.requiredIndicator),
    submitLabel: t(FORM_KEYS.submitLabel),
    privacy: {
      text: t(FORM_KEYS.privacyText),
      linkLabel: t(FORM_KEYS.privacyLinkLabel),
      closeLabel: t(FORM_KEYS.privacyCloseLabel),
    },
    honeypotLabel: t(FORM_KEYS.honeypotLabel),
    turnstile: {
      loading: t('form-turnstile-loading'),
      ready: t('form-turnstile-ready'),
      verified: t('form-turnstile-verified'),
      expired: t('form-turnstile-expired'),
      error: t('form-turnstile-error'),
      disabled: t('form-turnstile-disabled'),
      buttonPending: t('form-turnstile-button-pending'),
      buttonError: t('form-turnstile-button-error'),
      preview: t('form-turnstile-preview'),
    },
    errors: {
      token: {
        missing: t(FORM_ERROR_KEYS.token.missing),
      },
    },
    statuses: Object.fromEntries(
      Object.entries(FORM_STATUS_KEYS).map(
        ([status, key]) => [status, withSeconds(t(key))],
      ),
    ) as Record<FormStatusKey, string>,
    rateLimitedCountdown: t('form-status-rate_limited-countdown'),
    blocks: buildFormBlockLocales(t),
  };
};
