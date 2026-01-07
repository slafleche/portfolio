import { formConfig } from '@/config/formsConfig';
import type { Messages } from '@/data/locales';
import {
  buildFormBlockLocales,
  type FormBlockLocales,
} from '@/lib/locales/form/form.locale';
import {
  FORM_STATUS_KEYS,
  type FormStatusKey,
} from '@/lib/locales/form/form.status';

import type { Translator } from './helpers.locale';

export const FORM_KEYS = {
  heading: 'form-heading',
  formHeading: 'form-heading',
  successHeading: 'form-success-heading',
  errorHeading: 'form-error-heading',
  successBody: 'forms-form-success-body',
  errorBody: 'forms-form-error-body',
  requiredIndicator: 'form-required-indicator',
  privacyText: 'form-privacy-text',
  privacyLinkLabel: 'form-privacy-link-label',
  privacyCloseLabel: 'form-privacy-close-label',
  submitLabel: 'form-submit-label',
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
} as const satisfies Record<string, Record<string, keyof Messages>>;

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

export type FormErrorKey = (typeof FORM_ERROR_KEY_LIST)[number];

export type ContactFormCopy = {
  heading: string;
  headings: {
    form: string;
    success: string;
    error: string;
  };
  successBody: string;
  errorBody: string;
  requiredIndicator: string;
  submitLabel: string;
  privacy: {
    text: string;
    linkLabel: string;
    closeLabel: string;
  };
  errors: {
    token: {
      missing: string;
    };
  };
  statuses: Record<FormStatusKey, string>;
  rateLimitedCountdown: string;
  blocks: FormBlockLocales;
  bgDescription: string;
  bgTitle: string;
};

export const buildContactFormCopy = (
  t: Translator,
): ContactFormCopy => {
  const seconds = formConfig.rateLimit.windowSeconds.toString();
  const withSeconds = (value: string) =>
    value.includes('{seconds}')
      ? value.replace('{seconds}', seconds)
      : value;
  return {
    heading: t(FORM_KEYS.heading),
    headings: {
      form: t(FORM_KEYS.formHeading),
      success: t(FORM_KEYS.successHeading),
      error: t(FORM_KEYS.errorHeading),
    },
    successBody: t(FORM_KEYS.successBody),
    errorBody: t(FORM_KEYS.errorBody),
    requiredIndicator: t(FORM_KEYS.requiredIndicator),
    submitLabel: t(FORM_KEYS.submitLabel),
    privacy: {
      text: t(FORM_KEYS.privacyText),
      linkLabel: t(FORM_KEYS.privacyLinkLabel),
      closeLabel: t(FORM_KEYS.privacyCloseLabel),
    },
    errors: {
      token: {
        missing: t(FORM_ERROR_KEYS.token.missing),
      },
    },
    statuses: Object.fromEntries(
      Object.entries(FORM_STATUS_KEYS).map(([
        status,
        key,
      ]) => [
        status,
        withSeconds(t(key)),
      ]),
    ) as Record<FormStatusKey, string>,
    rateLimitedCountdown: t('form-status-rate_limited-countdown'),
    blocks: buildFormBlockLocales(t),
    bgDescription: t('contact-bg-description'),
    bgTitle: t('contact-bg-title'),
  };
};

export type { FormStatusKey };
