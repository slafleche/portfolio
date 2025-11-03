// app/layout.tsx
import '@/styles/globals.css';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { resolveLocale } from '@/lib/locales/locale';
import { GOOGLE_FONT_URLS_BY_LOCALE } from '@/data/generated/googleFonts.gen';

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const headerList = await headers();
  const requestedLocale = headerList.get('x-locale') ?? undefined;
  const lang = resolveLocale(requestedLocale);
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
