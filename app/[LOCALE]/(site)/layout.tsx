import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { resolveLocale } from '@/lib/locales/locale';
import { ResponsiveProvider } from '@/lib/responsive/ResponsiveProvider';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';
import { ContactDialogProvider } from '@/components/contact/ContactDialogProvider';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildMetaCopy } from '@/lib/locales/sections/meta.locale';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { SkipNavContent } from '@/components/SkipNavContent';
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
