import { headers } from 'next/headers';

import NotFound from '@/components/notFound';
import { resolveLocale } from '@/lib/locales/locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import {
  RENDER_MODE_HEADER,
  resolveRenderMode,
} from '@/lib/renderMode';
import { readSimpleHtml } from '@/server/simpleHtml/readSimpleHtml';

export default async function NotFoundPage() {
  const headerList = await headers();
  const requestedLocale = headerList.get('x-locale') ?? undefined;
  const locale = resolveLocale(requestedLocale);
  const renderMode = resolveRenderMode(
    headerList.get(RENDER_MODE_HEADER),
  );
  const simpleHtml =
    renderMode === 'simple'
      ? ''
      : await readSimpleHtml({ locale, route: '404' });
  const translator = await loadTranslator(locale);

  return (
    <>
      <noscript dangerouslySetInnerHTML={{ __html: simpleHtml }} />
      <NotFound
        title={translator('not_found-title')}
        backText={translator('not_found-back')}
        homeLink={`/${locale}`}
      />
    </>
  );
}
