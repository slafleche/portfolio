import { headers } from 'next/headers';

import NotFound from '@/components/notFound';
import { resolveLocale } from '@/lib/locales/locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';

export default async function NotFoundPage() {
  const headerList = await headers();
  const requestedLocale = headerList.get('x-locale') ?? undefined;
  const locale = resolveLocale(requestedLocale);
  const translator = await loadTranslator(locale);

  return (
    <NotFound
      title={translator('not_found-title')}
      backText={translator('not_found-back')} 
      homeLink={`/${locale}`}    />
  );
}
