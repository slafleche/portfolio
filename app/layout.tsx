import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { resolveLocale } from '@/lib/locales/locale';
import '@/styles/globals.css';
interface RootLayoutProps {
	children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get('locale')?.value;
	const lang = resolveLocale(cookieLocale);
	return (
		<html lang={lang}>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&family=Comfortaa:wght@300..700&display=swa"
				></link>
			</head>
			<body>{children}</body>
		</html>
	);
}
