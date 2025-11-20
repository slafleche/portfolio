import type { Translator } from '@/lib/locales/sections/helpers.locale';

export type HoneypotBlockLocale = {
  label: string;
};

const FORM_HONEYPOT_LABEL_KEY = 'form-honeypot-label';

export function buildHoneypotBlockLocale(
  translator: Translator,
): HoneypotBlockLocale {
  return {
    label: translator(FORM_HONEYPOT_LABEL_KEY),
  };
}
