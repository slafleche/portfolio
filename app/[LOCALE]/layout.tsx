import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import {
	resolveLocale,
	loadMessages,
	createTranslator,
} from '@/lib/locales/locale';
import { ResponsiveProvider } from '@/lib/responsive/ResponsiveProvider';
import LocaleProvider from '@/lib/locales/LocaleProvider';
import Menu from '@/components/Menu';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';

interface SegmentLayoutProps {
	children: ReactNode;
	params: Promise<{ LOCALE: string }>;
}

export default async function LocaleSegmentLayout({
	children,
	params,
}: SegmentLayoutProps) {
	const { LOCALE } = await params;
	const locale = resolveLocale(LOCALE);
	const messages = await loadMessages(locale);

	return (
		<LocaleProvider locale={locale} messages={messages}>
			<WindowSizeProvider>
				<ResponsiveProvider>
					<Menu />
					{children}
				</ResponsiveProvider>
			</WindowSizeProvider>
		</LocaleProvider>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ LOCALE: string }>;
}): Promise<Metadata> {
	const { LOCALE } = await params;
	const locale = resolveLocale(LOCALE);
	const messages = await loadMessages(locale);
	const t = createTranslator(messages);
	return {
		title: t('title' as const),
		description: t('description' as const),
	};
}
