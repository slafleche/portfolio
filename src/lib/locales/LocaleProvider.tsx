'use client';
import React from 'react';
import { LocaleProvider as BaseLocaleProvider } from './localeContext';
import type { Locale } from '@/data/locales';

export default function LocaleProvider({
	locale,
	children,
}: React.PropsWithChildren<{
	locale: Locale;
}>) {
	return (
		<BaseLocaleProvider locale={locale}>
			{children}
		</BaseLocaleProvider>
	);
}
