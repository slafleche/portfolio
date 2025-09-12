import { ReactNode, use } from 'react';
import type { Metadata } from 'next';
import { resolveLocale, getTranslator } from '@/lib/locales/locale';
import LocaleProvider from '@/lib/locales/LocaleProvider';
import Menu from '@/components/Menu';

interface SegmentLayoutProps {
	children: ReactNode;
	params: any;
}

export default function LocaleSegmentLayout({
	children,
	params,
}: SegmentLayoutProps) {
	const resolved =
		typeof (params as any)?.then === 'function'
			? use(params as Promise<any>)
			: (params as any);

	const locale = resolveLocale(resolved?.LOCALE);

	return (
		<LocaleProvider locale={locale}>
			<Menu />
			{children}
		</LocaleProvider>
	);
}

export function generateMetadata({ params }: { params: any }): Metadata {
	const locale = resolveLocale(params?.LOCALE);
	const t = getTranslator(locale);
	const title = t('title' as any);
	const description = t('description' as any);
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: 'website',
		},
	};
}
