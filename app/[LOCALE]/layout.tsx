import { ReactNode, use } from 'react';
import { resolveLocale } from '@/lib/locales/locale';
import LocaleProvider from '@/lib/locales/LocaleProvider';
import Menu from '@/components/Menu';
import SetHtmlLang from '@/components/SetHtmlLang';

interface SegmentLayoutProps {
  children: ReactNode;
  params: Promise<{ LOCALE?: string }> | { LOCALE?: string };
}

export default function LocaleSegmentLayout({
  children,
  params,
}: SegmentLayoutProps) {
  const resolved =
    typeof (params as any)?.then === 'function'
      ? use(params as Promise<{ LOCALE?: string }>)
      : (params as { LOCALE?: string });

  const locale = resolveLocale(resolved?.LOCALE);

  return (
    <LocaleProvider locale={locale}>
      <SetHtmlLang />
      <Menu />
      {children}
    </LocaleProvider>
  );
}
