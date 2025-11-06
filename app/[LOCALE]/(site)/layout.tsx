import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { resolveLocale } from '@/lib/locales/locale';
import { ResponsiveProvider } from '@/lib/responsive/ResponsiveProvider';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';
import { ContactDialogProvider } from '@/components/contact/ContactDialogProvider';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildMetaCopy } from '@/lib/locales/sections/meta.locale';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { SkipNavContent } from '@/components/SkipNavContent';

interface SiteLayoutProps {
  children: ReactNode;
}

export default async function SiteLayout({
  children,
}: SiteLayoutProps) {
  const headerList = headers();
  const requestedLocale = headerList instanceof Headers
    ? headerList.get('x-locale') ?? undefined
    : undefined;
  const locale = resolveLocale(requestedLocale);
  const translator = await loadTranslator(locale);
  const contactFormCopy = buildContactFormCopy(translator);
  const privacyCopy = buildPrivacyCopy(translator);

  return (
    <WindowSizeProvider>
      <ResponsiveProvider>
        <ContactDialogProvider
          formCopy={contactFormCopy}
          privacyCopy={privacyCopy}
          locale={locale}
        >
          <SkipNavContent id="body">{children}</SkipNavContent>
        </ContactDialogProvider>
      </ResponsiveProvider>
    </WindowSizeProvider>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const headerList = headers();
  const requestedLocale = headerList instanceof Headers
    ? headerList.get('x-locale') ?? undefined
    : undefined;
  const locale = resolveLocale(requestedLocale);
  const translator = await loadTranslator(locale);
  const meta = buildMetaCopy(translator);
  return {
    title: meta.title,
    description: meta.description,
  };
}
