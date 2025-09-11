import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { resolveLocale } from '@/lib/locales/locale';
import '@/styles/globals.css';
interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const cookieLocale = cookies().get('locale')?.value;
  const lang = resolveLocale(cookieLocale);
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
