import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { resolveLocale } from '@/lib/locales/locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildMetaCopy } from '@/lib/locales/sections/meta.locale';

interface SiteLayoutProps {
  children: ReactNode;
  params: Promise<{ LOCALE: string }>;
}

export default function SiteLayout({
  children,
}: SiteLayoutProps) {
  return <>{children}</>;
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
