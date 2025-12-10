import type { Messages } from '@/data/locales';

export const FORM_STATUS_CODES = [
  'success',
  'validation_error',
  'rate_limited',
  'service_unavailable',
  'not_configured',
  'blocked',
] as const;

export type FormServerStatusCode = (typeof FORM_STATUS_CODES)[number];

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

export type FormStatusKey = keyof typeof FORM_STATUS_KEYS;
