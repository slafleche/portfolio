import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { resolveLocale } from '@/lib/locales/locale';
import { ResponsiveProvider } from '@/lib/responsive/ResponsiveProvider';
import { WindowSizeProvider } from '@/lib/responsive/WindowSizeContext';
import Menu from '@/components/Menu';
import { ContactDialogProvider } from '@/components/contact/ContactDialogProvider';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildMetaCopy } from '@/lib/locales/sections/meta.locale';
import { canonicalToLocalizedSlugs } from '@/lib/routes/localeSlugs';
import {
  buildHomeMenuSections,
  buildSystemsMenuSections,
} from '@/lib/locales/sections/menuSections';

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
  const menuCopy = buildMenuCopy(translator);
  const menuSections = buildHomeMenuSections(translator);
  const systemsMenuSections = buildSystemsMenuSections(translator);

  const curiosityMessages = {
    title: translator('console-curiosity-title'),
    test: translator('console-curiosity-test'),
    result: translator('console-curiosity-result'),
    hint: translator('console-curiosity-hint'),
  };
  const systemsSlug =
    canonicalToLocalizedSlugs[locale]?.systems ?? 'systems';
  const curiosityTarget = `/${locale}/${systemsSlug}`;

  const menuProps = {
    root: `/${locale}`,
    skipNavLabel: menuCopy.skipNavLabel,
    leftLabel: menuCopy.leftLabel,
    rightLabel: menuCopy.rightLabel,
    localeChangeLabel: menuCopy.languageLabel,
    sections: menuSections,
    systemsSections: systemsMenuSections,
    localeLinks: AVAILABLE_LOCALES.filter(
      (code) => code !== locale,
    ).map((code) => ({
      locale: code,
      label: LOCALE_LABELS[code],
    })),
  };

  return (
    <WindowSizeProvider>
      <ResponsiveProvider>
        <ContactDialogProvider>
          <Menu
            {...menuProps}
            curiosityMessages={{
              title: curiosityMessages.title,
              test: curiosityMessages.test,
              result: curiosityMessages.result,
              hint: curiosityMessages.hint,
              targetHref: curiosityTarget,
            }}
            logoRedirectPaths={[curiosityTarget]}
          />
          {children}
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
