import type { EnMessages } from './en';
import type { FrMessages } from './fr';

export const AVAILABLE_LOCALES = [
	'en',
	'fr',
] as const;

export type Locale = (typeof AVAILABLE_LOCALES)[number];

type MessagesMap = {
	en: EnMessages;
	fr: FrMessages;
};

export type Messages = MessagesMap[Locale];

export const LOCALE_LABELS: Record<Locale, string> = {
	en: 'English',
	fr: 'Français',
};

export const LOCALE_LOADERS = {
	en: () => import('./en'),
	fr: () => import('./fr'),
} as const;
