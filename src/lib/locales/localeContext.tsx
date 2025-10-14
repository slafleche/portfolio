'use client';
import React, { createContext, useContext, useMemo } from 'react';
import type { Locale } from '@/data/locales';
import { LOCALE_LABELS } from '@/data/locales';

type Ctx = { locale: Locale };

// default context value is "en"
const Ctx = createContext<Ctx>({
	locale: 'en',
});

export function LocaleProvider({
	locale,
	children,
}: React.PropsWithChildren<{
	locale: Locale;
}>) {
	const value = useMemo(() => ({ locale }), [locale]);
	return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Overloads: default returns `Locale`; with `{ withLabel: true }` returns `{ locale, label }`.
export function useLocale(): Locale;
export function useLocale(options: { withLabel: true }): {
	locale: Locale;
	label: string;
	root: string;
};
export function useLocale(options: { withRoot: true }): {
	locale: Locale;
	root: string;
};
export function useLocale(options?: {
	withLabel?: boolean;
	withRoot?: boolean;
}) {
	const locale = useContext(Ctx).locale;
	const root = `/${locale}`;
	if (options?.withLabel) {
		return {
			locale,
			label: LOCALE_LABELS[locale],
			root,
		} as const;
	}
	if (options?.withRoot) {
		return { locale, root } as const;
	}
	return locale;
}
