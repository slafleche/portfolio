import { ReactNode } from 'react';
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
			<body>{children}</body>
		</html>
	);
}
