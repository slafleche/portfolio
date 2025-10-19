import { HTML_MESSAGES } from '@/lib/locales/generated/html.gen';
import { DEFAULT_LOCALE } from './locale';
import type { Locale } from '@/data/locales';

const escapeHtml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/\n/g, '<br />');

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
		localeHtml[key] ??
		fallbackHtml[key] ??
		escapeHtml(fallbackText)
	);
}
