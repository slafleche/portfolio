import { HTML_MESSAGES } from '@/lib/locales/generated/html.gen';
import { DEFAULT_LOCALE } from './locale';
import type { Locale } from '@/data/locales';
import { escapeHtml } from '@/lib/stringUtils';

export function getHtmlMessage(
	locale: Locale,
	key: string,
	fallbackText: string,
): string {
	const localeHtml =
		(HTML_MESSAGES as Record<string, Record<string, string>>)[locale] ?? {};
	const fallbackHtml =
		(HTML_MESSAGES as Record<string, Record<string, string>>)[
			DEFAULT_LOCALE
		] ?? {};

	return (
		localeHtml[key] ?? fallbackHtml[key] ?? escapeHtml(fallbackText)
	);
}
