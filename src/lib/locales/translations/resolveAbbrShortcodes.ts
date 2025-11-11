import type { AbbrLocaleEntry } from './abbrRenderer';
import { renderAbbreviation } from './abbrRenderer';

type AnyRecord = Record<string, unknown>;

const hasShortcode = (value: string) => value.includes('[abbr:');

const SHORTCODE_REGEX = /\[abbr:([^\]]+)\]/gi;

const collectAbbreviations = (data: AnyRecord) => {
	const map = new Map<string, AbbrLocaleEntry>();
	for (const [key, entry] of Object.entries(data)) {
		if (!key.startsWith('abbr-')) continue;
		if (
			entry &&
			typeof entry === 'object' &&
			'label' in entry &&
			'definition' in entry
		) {
			map.set(key, entry as AbbrLocaleEntry);
		}
	}
	return map;
};

const transformValue = (
	value: unknown,
	lookup: Map<string, AbbrLocaleEntry>,
	locale: string,
	parentKey?: string,
): unknown => {
	if (typeof value === 'string') {
		if (!hasShortcode(value)) return value;
		return value.replace(SHORTCODE_REGEX, (_match, term: string) =>
			renderAbbreviation({
				locale,
				term,
				lookup: (slug) => lookup.get(slug),
			}),
		);
	}

	if (Array.isArray(value)) {
		return value.map((item) =>
			transformValue(item, lookup, locale, parentKey),
		);
	}

	if (value && typeof value === 'object') {
		if (parentKey?.startsWith('abbr-')) {
			return value;
		}

		const entries = Object.entries(value).map(([key, child]) => [
			key,
			transformValue(child, lookup, locale, key),
		]);
		return Object.fromEntries(entries);
	}

	return value;
};

export function resolveAbbrShortcodes<
	T extends Record<string, unknown>,
>(data: T, locale: string): T {
	const lookup = collectAbbreviations(data);
	return transformValue(data, lookup, locale) as T;
}
