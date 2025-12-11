import { HTML_MESSAGES } from '@/lib/locales/generated/html.gen';
import { DEFAULT_LOCALE } from './locale';
import type { Locale } from '@/data/locales';
import { escapeHtml } from '@/lib/stringUtils';

const TYPED_HTML_MESSAGES: Record<Locale, Record<string, string>> =
  HTML_MESSAGES as Record<Locale, Record<string, string>>;

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
