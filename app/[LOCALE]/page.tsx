import { use } from 'react';
import {
  AVAILABLE_LOCALES,
  TRANSLATIONS,
  type Locale,
} from '@/data/locales.gen';
import { resolveLocale } from '@/lib/locales/locale';

type Params = { LOCALE?: string };
type Props = { params: Promise<Params> | Params };

export default function HomePage({ params }: Props) {
  // Unwrap if Next passes a Promise for params
  const resolved =
    typeof (params as any)?.then === 'function'
      ? use(params as Promise<Params>)
      : (params as Params);

  // Respect URL param; only fall back if invalid/missing
  const locale: Locale = resolveLocale(resolved?.LOCALE);

  const t = (key: keyof (typeof TRANSLATIONS)[Locale]) =>
    TRANSLATIONS[locale]?.[key] ?? key;

  const otherLocales = (AVAILABLE_LOCALES as readonly string[]).filter(
    (l) => l !== locale,
  ) as Locale[];

  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </>
  );
}
