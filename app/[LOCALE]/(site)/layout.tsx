import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ContactDialogProvider } from '@/components/contact/ContactDialogProvider';
import { ImageByNamePrefetcher } from '@/components/ImageByName';
import { SkipNavContent } from '@/components/SkipNavContent';
import { resolveLocale } from '@/lib/locales/locale';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildMetaCopy } from '@/lib/locales/sections/meta.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { ResponsiveProvider } from '@/lib/responsive/ResponsiveProvider';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';
import { getTurnstileEnvConfig } from '@/lib/runtimeEnv';

interface SiteLayoutProps {
  children: ReactNode;
  params: Promise<{ LOCALE: string }>;
}

export default async function SiteLayout({
  children,
  params,
}: SiteLayoutProps) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const translator = await loadTranslator(locale);
  const contactFormCopy = buildContactFormCopy(translator);
  const privacyCopy = buildPrivacyCopy(translator);
  const closeLabel = translator('close-label');
  const { siteKey: turnstileSiteKey } = getTurnstileEnvConfig();

  return (
    <WindowSizeProvider>
      <ResponsiveProvider>
        <ContactDialogProvider
          formCopy={contactFormCopy}
          privacyCopy={privacyCopy}
          closeLabel={closeLabel}
          turnstileSiteKey={turnstileSiteKey}
        >
          <ImageByNamePrefetcher
            prefetchOnIdle={[
              'night_forest',
            ]}
          />
          <SkipNavContent id="body">{children}</SkipNavContent>
        </ContactDialogProvider>
      </ResponsiveProvider>
    </WindowSizeProvider>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ LOCALE: string }>;
}): Promise<Metadata> {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const translator = await loadTranslator(locale);
  const meta = buildMetaCopy(translator);
  return {
    title: meta.title,
    description: meta.description,
  };
}
