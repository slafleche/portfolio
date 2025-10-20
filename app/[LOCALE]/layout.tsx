import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import {
	resolveLocale,
	loadMessages,
	createTranslator,
} from '@/lib/locales/locale';
import { ResponsiveProvider } from '@/lib/responsive/ResponsiveProvider';
import Menu from '@/components/Menu';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { BASE_ANCHORS } from '@/components/menu/menuUtils';

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

	const resolveText = <K extends keyof typeof messages>(
		key: K,
		fallback: string,
	): string => {
		const value = messages[key];
		return typeof value === 'string' ? value : fallback;
	};

	const menuSections = BASE_ANCHORS.map(({ hrefKey, labelKey }) => ({
		id: resolveText(hrefKey, hrefKey),
		label: resolveText(labelKey, labelKey),
	}));

	const menuProps = {
		root: `/${locale}`,
		skipNavLabel: resolveText('menu-skip_nav', 'Skip to content'),
		leftLabel: resolveText('menu-left_label', 'About Me'),
		rightLabel: resolveText('menu-right_label', 'My Work'),
		localeChangeLabel: resolveText('localeChange', 'Select language'),
		sections: menuSections,
		localeLinks: AVAILABLE_LOCALES.filter(
			(code) => code !== locale,
		).map((code) => ({
			locale: code,
			label: LOCALE_LABELS[code],
		})),
	};

	return (
		<WindowSizeProvider>
			<ResponsiveProvider>
				<Menu
					{...menuProps}
					// bokehDebug={{
					// 	showArchPath: true,
					// 	disableTimeout: true,
					// 	raiseLayer: true,
					// }}
				/>
				{children}
			</ResponsiveProvider>
		</WindowSizeProvider>
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
