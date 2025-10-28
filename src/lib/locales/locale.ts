import {
	AVAILABLE_LOCALES,
	LOCALE_LOADERS,
	type Locale,
	type Messages,
} from '../../data/locales';
import {
	MARKDOWN_MESSAGE_KEYS,
	type LocaleMessagesShape,
} from './localeTypes';

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Only validate an explicit candidate (e.g. from the URL). NOTE: No
 * browser checks here — explicit URL always wins.
 */
export function resolveLocale(candidate?: string): Locale {
	return candidate &&
		(AVAILABLE_LOCALES as readonly string[]).includes(candidate)
		? (candidate as Locale)
		: DEFAULT_LOCALE;
}

/** Prefer the current browser UI (client-only). */
export function getBrowserLocale(): Locale | null {
	if (typeof navigator === 'undefined') return null;
	const langs = (
		navigator.languages ?? [
			navigator.language,
		]
	).filter(Boolean);
	for (const tag of langs) {
		const base = tag.slice(0, 2);
		if ((AVAILABLE_LOCALES as readonly string[]).includes(base)) {
			return base as Locale;
		}
	}
	return null;
}

/** Server-friendly fallback from the Accept-Language header. */
export function pickLocaleFromAcceptLanguage(
	accept: string | null,
): Locale | null {
	if (!accept) return null;
	for (const part of accept.split(',')) {
		const base = part.split(';')[0].trim().slice(0, 2);
		if ((AVAILABLE_LOCALES as readonly string[]).includes(base)) {
			return base as Locale;
		}
	}
	return null;
}

let defaultMessagesCache: LocaleMessagesShape | null = null;

const loadDefaultMessages = async (): Promise<LocaleMessagesShape> => {
	if (!defaultMessagesCache) {
		const mod = await LOCALE_LOADERS[DEFAULT_LOCALE]();
		defaultMessagesCache = mod.default as LocaleMessagesShape;
	}
	return defaultMessagesCache;
};

export async function loadMessages(locale: Locale): Promise<Messages> {
	const mod = await LOCALE_LOADERS[locale]();
	const resolved = mod.default as Messages;
	const typed = resolved as LocaleMessagesShape;

	if (process.env.NODE_ENV !== 'production' && locale !== DEFAULT_LOCALE) {
		const fallback = await loadDefaultMessages();
		for (const key of MARKDOWN_MESSAGE_KEYS) {
			const value = typed[key];
			if (value === undefined || value === fallback[key]) {
				console.error(
					`[locales] Locale "${locale}" is missing markdown copy for "${key}". Falling back to default locale.`,
				);
			}
		}
	}

	return resolved;
}

export function createTranslator(messages: Messages) {
	return <Key extends keyof Messages>(key: Key) =>
		messages[key] ?? (key as string);
}

export async function getTranslator(locale: Locale) {
	const messages = await loadMessages(locale);
	return createTranslator(messages);
}
