import {
	DEFAULT_LOCALE,
	loadMessages,
	resolveLocale,
} from '@/lib/locales/locale';
import type { Messages } from '@/data/locales';

type MessageKey = keyof Messages;

export type Translator = <K extends MessageKey>(key: K) => string;

export function createSectionTranslator(
 messages: Messages,
 fallbackMessages: Messages,
): Translator {
	return (key) => {
		const value = messages[key];
		if (typeof value === 'string') {
			return value;
		}

		const fallbackValue = fallbackMessages[key];
		if (typeof fallbackValue === 'string') {
			return fallbackValue;
		}

		return key;
	};
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

export async function loadTranslator(locale: string): Promise<Translator> {
	const { messages, fallbackMessages } = await loadLocaleBlock(locale);
	return createSectionTranslator(messages, fallbackMessages);
}
