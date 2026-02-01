import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { isLocale } from '@/lib/locales/locale';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ LOCALE: string }>;
}) {
  const { LOCALE } = await params;

  if (!isLocale(LOCALE)) {
    notFound();
  }
  return <>{children}</>;
}
