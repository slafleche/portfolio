// This page is only to redirect from `/` to `/{locale}`
import { headers } from 'next/headers';
import {
  DEFAULT_LOCALE,
  pickLocaleFromAcceptLanguage,
  getTranslator,
} from '@/lib/locales/locale';
import LocaleAutoRedirect from '@/components/LocaleAutoRedirect';
import type { Locale } from '@/data/locales.gen';

export default async function RootPage() {
  const accept = (await headers()).get('accept-language');
  const fallback: Locale =
    pickLocaleFromAcceptLanguage(accept) ?? DEFAULT_LOCALE;

  const t = getTranslator(fallback); // 👈 use t from fallback locale

  return (
    <>
      <LocaleAutoRedirect fallback={fallback} />
      <p>{t('redirecting')}</p>
    </>
  );
}
