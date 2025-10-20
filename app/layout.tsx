// app/layout.tsx
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { resolveLocale } from '@/lib/locales/locale';
import '@/styles/globals.css';
import Script from 'next/script';

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

                {/* Preload each stylesheet as style (no handlers here) */}
                {fontUrls.map((href) => (
                    <link
                        key={`${href}-preload`}
                        rel="preload"
                        as="style"
                        href={href}
                        data-font-preload="1"
                    />
                ))}

                {/* No-JS fallback */}
                {fontUrls.map((href) => (
                    <noscript key={`${href}-noscript`}>
                        <link rel="stylesheet" href={href} />
                    </noscript>
                ))}

                <Script
                    id="fonts-preload-flip"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                        (function(){
                        var links = document.querySelectorAll('link[rel="preload"][as="style"][data-font-preload="1"]');
                        links.forEach(function(l){
                            // Flip immediately so the browser "uses" the preloaded response.
                            l.rel = 'stylesheet';
                        });
                        })();
                    `.trim(),
                    }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
