// app/layout.tsx
import '@/styles/globals.css';

import { headers } from 'next/headers';
import Script from 'next/script';
import type { ReactNode } from 'react';

import { RenderModeProvider } from '@/components/renderMode/RenderModeContext';
import SmoothScrollIdle from '@/components/SmoothScrollIdle';
import debugRoutes from '@/data/debugRoutes.json';
import {
  FAVICON_DEFAULT_WEB_MANIFEST,
  FAVICON_LINK_DESCRIPTORS_BY_LOCALE,
  FAVICON_MANIFEST_META_BY_LOCALE,
  FAVICON_META_TAGS,
} from '@/data/generated/favicons/manifest.favicons.gen';
import { GOOGLE_FONT_URLS } from '@/data/generated/fonts/googleFonts.gen';
import { resolveLocale } from '@/lib/locales/locale';
import { type Locale } from '@/lib/locales/translations';
import {
  RENDER_MODE_HEADER,
  resolveRenderMode,
} from '@/lib/renderMode';

import {
  isIndexingAllowed,
  isRelease,
  isStaging,
  notRelease,
} from '../src/lib/runtimeEnv';

const GA_RELEASE_ID = 'G-VF8QHEKQS8';
const GA_STAGING_ID = 'G-JLTPT80N2J';

if (notRelease()) {
  const envKey = '__DEBUG_ROUTES_LOGGED__';
  const envTracker = process.env as Record<
    string,
    string | undefined
  >;
  if (envTracker[envKey] !== '1') {
    envTracker[envKey] = '1';
    const debugLocale = debugRoutes.baseLocale;
    const debugRouteList = debugRoutes.pages.map(
      (page) => `/${debugLocale}/debug/${page}`,
    );
    console.info(
      '[debug] Debug previews available:',
      debugRouteList.join(', '),
    );
  }
}

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const headerList = await headers();
  const requestedLocale = headerList.get('x-locale') ?? undefined;
  const renderMode = resolveRenderMode(
    headerList.get(RENDER_MODE_HEADER),
  );
  const locale = resolveLocale(requestedLocale);
  const fallbackLocale =
    FAVICON_DEFAULT_WEB_MANIFEST.locale as Locale;
  const fontUrls = GOOGLE_FONT_URLS;
  const linkGroup =
    FAVICON_LINK_DESCRIPTORS_BY_LOCALE[locale] ??
    FAVICON_LINK_DESCRIPTORS_BY_LOCALE[fallbackLocale];
  const manifestMeta =
    FAVICON_MANIFEST_META_BY_LOCALE[locale] ??
    FAVICON_MANIFEST_META_BY_LOCALE[fallbackLocale];
  const gaMeasurementId = isStaging() ? GA_STAGING_ID : GA_RELEASE_ID;
  const indexingAllowed = isIndexingAllowed();
  const fontFacesHref = isRelease()
    ? '/styles/fontFaces.css'
    : '/styles/fontFaces._staging.gen.css';

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={fontFacesHref} />

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
        <meta
          name="robots"
          content={
            indexingAllowed ? 'index,follow' : 'noindex,nofollow'
          }
        />
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
      <body>
        <RenderModeProvider mode={renderMode}>
          {children}
        </RenderModeProvider>
        <SmoothScrollIdle />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="ga-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`}
        </Script>
      </body>
    </html>
  );
}
