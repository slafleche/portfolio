// app/layout.tsx
import '@/styles/globals.css';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { resolveLocale } from '@/lib/locales/locale';
import { GOOGLE_FONT_URLS_BY_LOCALE } from '@/data/generated/googleFonts.gen';
import {
  FAVICON_DEFAULT_WEB_MANIFEST,
  FAVICON_LINK_DESCRIPTORS_BY_LOCALE,
  FAVICON_MANIFEST_META_BY_LOCALE,
  FAVICON_META_TAGS,
} from '@/data/generated/favicons.manifest.gen';
import {
  AVAILABLE_LOCALES,
  type Locale,
} from '@/lib/locales/translations';

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const headerList = await headers();
  const requestedLocale = headerList.get('x-locale') ?? undefined;
  const locale = resolveLocale(requestedLocale);
  const fallbackLocale = FAVICON_DEFAULT_WEB_MANIFEST
    .locale as Locale;
  const fontUrls = GOOGLE_FONT_URLS_BY_LOCALE[locale] ?? [];
  const linkGroup =
    FAVICON_LINK_DESCRIPTORS_BY_LOCALE[locale] ??
    FAVICON_LINK_DESCRIPTORS_BY_LOCALE[fallbackLocale];
  const manifestMeta =
    FAVICON_MANIFEST_META_BY_LOCALE[locale] ??
    FAVICON_MANIFEST_META_BY_LOCALE[fallbackLocale];

  if (process.env.NODE_ENV !== 'production') {
    const globalTracker = globalThis as {
      __debugRoutesLogged?: boolean;
    };
    if (!globalTracker.__debugRoutesLogged) {
      globalTracker.__debugRoutesLogged = true;
      const debugRoutes = AVAILABLE_LOCALES.map(
        (loc) => `/${loc}/debug/favicons`,
      );
      console.info(
        '[debug] Favicons preview available:',
        debugRoutes.join(', '),
      );
    }
  }

  return (
    <html lang={locale}>
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

        {linkGroup.main.map((descriptor) => {
          const sizePart =
            'sizes' in descriptor && descriptor.sizes
              ? descriptor.sizes
              : '';
          const key = `${descriptor.rel}-${descriptor.href}-${sizePart}`;
          const linkProps: Record<string, string> = {
            rel: descriptor.rel,
            href: descriptor.href,
          };
          if ('type' in descriptor && descriptor.type) {
            linkProps.type = descriptor.type;
          }
          if ('sizes' in descriptor && descriptor.sizes) {
            linkProps.sizes = descriptor.sizes;
          }
          if ('color' in descriptor && descriptor.color) {
            linkProps.color = descriptor.color;
          }
          return <link key={key} {...linkProps} />;
        })}

        <meta
          name="application-name"
          content={manifestMeta.shortName}
        />
        <meta
          name="apple-mobile-web-app-title"
          content={manifestMeta.shortName}
        />
        <meta name="description" content={manifestMeta.description} />
        <meta
          name="theme-color"
          content={FAVICON_META_TAGS.themeColorLight}
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content={FAVICON_META_TAGS.themeColorDark}
          media="(prefers-color-scheme: dark)"
        />
        <meta
          name="msapplication-TileColor"
          content={FAVICON_META_TAGS.msTileColor}
        />
        {FAVICON_META_TAGS.msApplicationConfig ? (
          <meta
            name="msapplication-config"
            content={FAVICON_META_TAGS.msApplicationConfig}
          />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
