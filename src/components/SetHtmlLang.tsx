'use client';
import { useEffect } from 'react';
import { useLocale } from '@/lib/locales/localeContext';

export default function SetHtmlLang() {
	const locale = useLocale();
	useEffect(() => {
		if (typeof document !== 'undefined') {
			const current = document.documentElement.getAttribute('lang');
			if (current !== locale) {
				document.documentElement.setAttribute('lang', locale);
			}
		}
	}, [
		locale,
	]);
	return null;
}
