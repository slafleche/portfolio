'use client';
import { useLocale } from './localeContext';
import { getTranslator } from './locale';

export function useT() {
	const locale = useLocale();
	return getTranslator(locale);
}
