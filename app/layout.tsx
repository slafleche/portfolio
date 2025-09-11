import { ReactNode, use } from 'react';
import { resolveLocale } from '@/lib/locales/locale';
import LocaleProvider from '@/lib/locales/LocaleProvider';
import Menu from '@/components/Menu';
import '@/styles/globals.css';
import Script from 'next/script';
interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ LOCALE?: string }>;
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  const { LOCALE } = use(params);
  const locale = resolveLocale(LOCALE);

  return (
    <html lang={locale}>
      <head></head>
      <body>
        <LocaleProvider locale={locale}>
          <Menu />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
