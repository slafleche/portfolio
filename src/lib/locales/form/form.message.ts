import type { Translator } from '@/lib/locales/sections/helpers.locale';
import { FORM_REQUIRED_INDICATOR_KEY } from './shared';
import { MESSAGE_MIN_LENGTH } from '@/modules/contactForm/validation.constants';

export type MessageBlockLocale = {
  label: string;
  requiredText: string;
  counterTemplate: string;
  maxCharactersMessage: string;
  urlUsageTemplate: string;
  maxUrlsMessage: string;
  errors: {
    required: string;
    tooShort: string;
    tooLong: string;
    tooManyLinks: string;
  };
};

const LABEL_KEY = 'form-message-label';
const COUNTER_KEY = 'form-counter-remaining';
const MESSAGE_KEYS = {
  maxChars: 'form-message-max_chars',
  urlUsage: 'form-message-url_usage',
  maxLinks: 'form-message-max_links',
} as const;

const ERROR_KEYS = {
  required: 'form-error-message-required',
  tooShort: 'form-error-message-too_short',
  tooLong: 'form-error-message-too_long',
  tooManyLinks: 'form-error-message-too_many_links',
} as const;

export function buildMessageBlockLocale(
  translator: Translator,
): MessageBlockLocale {
  const min = MESSAGE_MIN_LENGTH.toString();
  const withMin = (value: string) =>
    value.includes('{min}') ? value.replace('{min}', min) : value;
  return {
    label: translator(LABEL_KEY),
    requiredText: translator(FORM_REQUIRED_INDICATOR_KEY),
    counterTemplate: translator(COUNTER_KEY),
    maxCharactersMessage: translator(MESSAGE_KEYS.maxChars),
    urlUsageTemplate: translator(MESSAGE_KEYS.urlUsage),
    maxUrlsMessage: translator(MESSAGE_KEYS.maxLinks),
    errors: {
      required: translator(ERROR_KEYS.required),
      tooShort: withMin(translator(ERROR_KEYS.tooShort)),
      tooLong: translator(ERROR_KEYS.tooLong),
      tooManyLinks: translator(ERROR_KEYS.tooManyLinks),
    },
  };
}
