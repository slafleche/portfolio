import type { Translator } from '@/lib/locales/sections/helpers.locale';

import { FORM_REQUIRED_INDICATOR_KEY } from './shared';

export type TurnstileBlockLocale = {
  label: string;
  requiredText: string;
  statuses: {
    loading: string;
    ready: string;
    verified: string;
    expired: string;
    error: string;
    disabled: string;
  };
  buttons: {
    pending: string;
    error: string;
  };
  preview: string;
  summary: {
    missing: string;
    expired: string;
    error: string;
  };
};

const TURNSTILE_LABEL_KEY = 'form-turnstile-label';
const STATUS_KEYS = {
  loading: 'form-turnstile-loading',
  ready: 'form-turnstile-ready',
  verified: 'form-turnstile-verified',
  expired: 'form-turnstile-expired',
  error: 'form-turnstile-error',
  disabled: 'form-turnstile-disabled',
} as const;

const BUTTON_KEYS = {
  pending: 'form-turnstile-button-pending',
  error: 'form-turnstile-button-error',
} as const;

const PREVIEW_KEY = 'form-turnstile-preview';
const SUMMARY_KEYS = {
  missing: 'form-turnstile-summary-missing',
  expired: 'form-turnstile-summary-expired',
  error: 'form-turnstile-summary-error',
} as const;

export function buildTurnstileBlockLocale(
  translator: Translator,
): TurnstileBlockLocale {
  return {
    label: translator(TURNSTILE_LABEL_KEY),
    requiredText: translator(FORM_REQUIRED_INDICATOR_KEY),
    statuses: {
      loading: translator(STATUS_KEYS.loading),
      ready: translator(STATUS_KEYS.ready),
      verified: translator(STATUS_KEYS.verified),
      expired: translator(STATUS_KEYS.expired),
      error: translator(STATUS_KEYS.error),
      disabled: translator(STATUS_KEYS.disabled),
    },
    buttons: {
      pending: translator(BUTTON_KEYS.pending),
      error: translator(BUTTON_KEYS.error),
    },
    preview: translator(PREVIEW_KEY),
    summary: {
      missing: translator(SUMMARY_KEYS.missing),
      expired: translator(SUMMARY_KEYS.expired),
      error: translator(SUMMARY_KEYS.error),
    },
  };
}
