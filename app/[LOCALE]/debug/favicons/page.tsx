import type { PageParams } from '@/styles/helpers/types';
import { notFound } from 'next/navigation';
import {
  FAVICON_ANDROID_ICONS,
  FAVICON_APPLE_TOUCH_ICON,
  FAVICON_BROWSERCONFIG,
  FAVICON_ICO,
  FAVICON_LINK_DESCRIPTORS,
  FAVICON_MASKABLE_ICON,
  FAVICON_MASK_ICON,
  FAVICON_META_TAGS,
  FAVICON_MS_TILE,
  FAVICON_PNG_VARIANTS,
  FAVICON_SVG,
  FAVICON_THEME_COLORS,
  FAVICON_WEB_MANIFEST,
} from '@/data/generated/favicons.manifest.gen';
import { resolveLocale } from '@/lib/locales/locale';
import FaviconPreview from '@/components/debug/FaviconPreview';

export default async function FaviconDebugPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);

  if (!locale) {
    notFound();
  }

  const data = {
    svg: FAVICON_SVG,
    ico: FAVICON_ICO,
    pngVariants: FAVICON_PNG_VARIANTS,
    appleTouch: FAVICON_APPLE_TOUCH_ICON,
    androidIcons: FAVICON_ANDROID_ICONS,
    maskIcon: FAVICON_MASK_ICON,
    maskableIcon: FAVICON_MASKABLE_ICON,
    msTile: FAVICON_MS_TILE,
    browserConfig: FAVICON_BROWSERCONFIG,
    webManifest: FAVICON_WEB_MANIFEST,
    themeColors: FAVICON_THEME_COLORS,
    metaTags: FAVICON_META_TAGS,
    linkDescriptors: FAVICON_LINK_DESCRIPTORS,
  };

  return <FaviconPreview data={data} locale={locale} />;
}
