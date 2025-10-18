import en from './en';
import fr from './fr';

export const TRANSLATIONS = {
	en,
	fr,
} as const;

export type Locale = keyof typeof TRANSLATIONS;
export type Messages = (typeof TRANSLATIONS)[Locale];

export const AVAILABLE_LOCALES = Object.keys(
	TRANSLATIONS,
) as Locale[];

export const LOCALE_LABELS: Record<Locale, string> =
	Object.fromEntries(
		AVAILABLE_LOCALES.map((locale) => [
			locale,
			TRANSLATIONS[locale].label,
		]),
	) as Record<Locale, string>;
