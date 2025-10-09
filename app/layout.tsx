// app/layout.tsx
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { resolveLocale } from '@/lib/locales/locale';
import '@/styles/globals.css';
import { generateGoogleFontUrls } from '../src/lib/gfonts';
import fontData from '@/data/fonts.config.json';

interface RootLayoutProps {
	children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get('locale')?.value;
	const lang = resolveLocale(cookieLocale);

	// Generate optimized font URLs
	const fontUrls = generateGoogleFontUrls(fontData, {
		display: 'swap',
		subsets: ['latin'],
		stripWhitespaceFromText: false,
	});

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
