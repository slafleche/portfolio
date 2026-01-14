import type { Messages } from '@/data/locales';
import type {
  MessageKey,
  Translator,
} from '@/lib/locales/sections/helpers.locale';
import { enFormCopy } from '@/lib/locales/translations/forms/en.form';

const enFormRaw = enFormCopy as Partial<Messages>;

export const enFormTranslator = ((key: MessageKey): string => {
  const value = enFormRaw[key];
  return typeof value === 'string' ? value : key;
}) as Translator;

enFormTranslator.raw = (key) => enFormRaw[key];
