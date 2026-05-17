import type { Locale } from '@/data/locales';
import { HTML_MESSAGES } from '@/lib/locales/generated/html.gen';
import { escapeHtml } from '@/lib/stringUtils';

import { DEFAULT_LOCALE } from './locale';

const TYPED_HTML_MESSAGES: Record<Locale, Record<string, string>> =
  HTML_MESSAGES;

export function getHtmlMessage(
  locale: Locale,
  key: string,
  fallbackText: string,
): string {
  const localeHtml = TYPED_HTML_MESSAGES[locale] ?? {};
  const fallbackHtml = TYPED_HTML_MESSAGES[DEFAULT_LOCALE] ?? {};

  return (
    localeHtml[key] ?? fallbackHtml[key] ?? escapeHtml(fallbackText)
  );
}
