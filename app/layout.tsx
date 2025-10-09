// app/layout.tsx
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { resolveLocale } from '@/lib/locales/locale';
import '@/styles/globals.css';

import { GOOGLE_FONT_URLS_BY_LOCALE } from '@/data/generated/googleFonts.gen';

interface RootLayoutProps {
	children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get('locale')?.value;
	const lang = resolveLocale(cookieLocale);

	// If resolveLocale already narrows to 'en' | 'fr', this cast isn't needed.
	const fontUrls = GOOGLE_FONT_URLS_BY_LOCALE[lang] ?? [];

	return (
		<html lang={lang}>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				{fontUrls.map((href) => (
					<link key={href} rel="stylesheet" href={href} />
				))}
			</head>
			<body>{children}</body>
		</html>
	);
}
