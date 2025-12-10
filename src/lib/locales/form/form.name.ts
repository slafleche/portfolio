import type { Translator } from '@/lib/locales/sections/helpers.locale';
import { FORM_REQUIRED_INDICATOR_KEY } from './shared';

export type NameBlockLocale = {
  label: string;
  requiredText: string;
  errors: {
    required: string;
    tooLong: string;
  };
};

const FORM_LABEL_KEYS = {
  name: 'form-name-label',
} as const;

const FORM_ERROR_KEYS = {
  required: 'form-error-name-required',
  tooLong: 'form-error-name-too_long',
} as const;

export function buildNameBlockLocale(t: Translator): NameBlockLocale {
  return {
    label: t(FORM_LABEL_KEYS.name),
    requiredText: t(FORM_REQUIRED_INDICATOR_KEY),
    errors: {
      required: t(FORM_ERROR_KEYS.required),
      tooLong: t(FORM_ERROR_KEYS.tooLong),
    },
  };
}
