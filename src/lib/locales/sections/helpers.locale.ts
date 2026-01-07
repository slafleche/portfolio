import type { Messages } from '@/data/locales';
import {
  DEFAULT_LOCALE,
  loadMessages,
  resolveLocale,
} from '@/lib/locales/locale';
import type { EnData } from '@/lib/locales/translations/en.data';

export type MessageKey = keyof EnData;

export type Translator = ((key: MessageKey) => string) & {
  /**
   * Access the untranslated value for structured data
   * (arrays/objects). Returns the fallback locale value when the
   * primary locale is missing.
   */
  raw: <K extends MessageKey>(key: K) => Messages[K] | undefined;
};

export function createSectionTranslator(
  messages: Messages,
  fallbackMessages: Messages,
): Translator {
  const translator = ((key: MessageKey): string => {
    const value = messages[key];
    if (typeof value === 'string') {
      return value;
    }

    const fallbackValue = fallbackMessages[key];
    if (typeof fallbackValue === 'string') {
      return fallbackValue;
    }

    return key;
  }) as Translator;

  translator.raw = (key) =>
    messages[key] !== undefined
      ? messages[key]
      : fallbackMessages[key];

  return translator;
}

export async function loadLocaleBlock(
  locale: string,
): Promise<{ messages: Messages; fallbackMessages: Messages }> {
  const resolved = resolveLocale(locale);
  const messages = await loadMessages(resolved);
  if (resolved === DEFAULT_LOCALE) {
    return { messages, fallbackMessages: messages };
  }

  const fallbackMessages = await loadMessages(DEFAULT_LOCALE);
  return { messages, fallbackMessages };
}

export async function loadTranslator(
  locale: string,
): Promise<Translator> {
  const { messages, fallbackMessages } =
    await loadLocaleBlock(locale);
  return createSectionTranslator(messages, fallbackMessages);
}
