import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { resolveLocale } from '@/lib/locales/locale';
import { ResponsiveProvider } from '@/lib/responsive/ResponsiveProvider';
import Menu from '@/components/Menu';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { BASE_ANCHORS } from '@/components/menu/menuUtils';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildMetaCopy } from '@/lib/locales/sections/meta.locale';

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
	const t = await loadTranslator(locale);
	const menuCopy = buildMenuCopy(t);

	const menuSections = BASE_ANCHORS.map(({ hrefKey, labelKey }) => ({
		id: t(hrefKey),
		label: t(labelKey),
	}));

	const menuProps = {
		root: `/${locale}`,
		skipNavLabel: menuCopy.skipNavLabel,
		leftLabel: menuCopy.leftLabel,
		rightLabel: menuCopy.rightLabel,
		localeChangeLabel: menuCopy.languageLabel,
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
					//     showArchPath: true,
					//     disableTimeout: true,
					//     raiseLayer: true,
					// }}
					// focusDebug={{
					// 	lockTo: 1,
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
	const t = await loadTranslator(locale);
	const meta = buildMetaCopy(t);
	return {
		title: meta.title,
		description: meta.description,
	};
}
