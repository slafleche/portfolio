'use client';
import React from 'react';
import { LocaleProvider as BaseLocaleProvider } from './localeContext';
import type { Locale, Messages } from '@/data/locales';

export default function LocaleProvider({
	locale,
	messages,
	children,
}: React.PropsWithChildren<{
	locale: Locale;
	messages: Messages;
}>) {
	return (
		<BaseLocaleProvider locale={locale} messages={messages}>
			{children}
		</BaseLocaleProvider>
	);
}
