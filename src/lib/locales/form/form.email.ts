import type { Translator } from '@/lib/locales/sections/helpers.locale';
import { FORM_REQUIRED_INDICATOR_KEY } from './shared';

export type EmailBlockLocale = {
  label: string;
  requiredText: string;
  errors: {
    invalid: string;
  };
};

const FORM_LABEL_KEY = 'form-email-label';
const FORM_ERROR_KEY = 'form-error-email-invalid';

export function buildEmailBlockLocale(
  translator: Translator,
): EmailBlockLocale {
  return {
    label: translator(FORM_LABEL_KEY),
    requiredText: translator(FORM_REQUIRED_INDICATOR_KEY),
    errors: {
      invalid: translator(FORM_ERROR_KEY),
    },
  };
}
