import path from 'node:path';
import { access } from 'node:fs/promises';
import FavIconPreview from '@/components/debug/FaviconPreview';
import {
  FAVICON_ANDROID_ICONS,
  FAVICON_APPLE_TOUCH_ICON,
  FAVICON_BROWSERCONFIG,
  FAVICON_DEFAULT_WEB_MANIFEST,
  FAVICON_ICO,
  FAVICON_LINK_DESCRIPTORS_BY_LOCALE,
  
  FAVICON_MANIFEST_META_BY_LOCALE,
  FAVICON_MASKABLE_ICON,
  FAVICON_MASK_ICON,
  FAVICON_META_TAGS,
  FAVICON_MS_TILE,
  FAVICON_PNG_VARIANTS,
  FAVICON_SVG,
  FAVICON_WEB_MANIFESTS,
} from '@/data/generated/favicons.manifest.gen';
import { faviconThemeColors } from '@/tokens/favicon.tokens';

type DebugParams = Promise<{ LOCALE: string }>;
type LocaleKey = keyof typeof FAVICON_WEB_MANIFESTS;

export default async function FaviconDebugPage({
  params,
}: {
  params: DebugParams;
}) {
  const { LOCALE } = await params;
  const availableLocales = Object.keys(
    FAVICON_WEB_MANIFESTS,
  ) as LocaleKey[];
  const fallbackLocale = FAVICON_DEFAULT_WEB_MANIFEST
    .locale as LocaleKey;
  const locale = (availableLocales.includes(
    LOCALE as LocaleKey,
  )
    ? LOCALE
    : fallbackLocale) as LocaleKey;

  const linkDescriptors =
    FAVICON_LINK_DESCRIPTORS_BY_LOCALE[locale] ??
    FAVICON_LINK_DESCRIPTORS_BY_LOCALE[fallbackLocale];
  const manifestMeta =
    FAVICON_MANIFEST_META_BY_LOCALE[locale] ??
    FAVICON_MANIFEST_META_BY_LOCALE[fallbackLocale];
  const webManifest =
    FAVICON_WEB_MANIFESTS[locale] ??
    FAVICON_WEB_MANIFESTS[fallbackLocale] ??
    FAVICON_DEFAULT_WEB_MANIFEST;

  const assetsToVerify = [
    FAVICON_SVG.fileName,
    FAVICON_ICO.fileName,
    FAVICON_APPLE_TOUCH_ICON.fileName,
    FAVICON_MASK_ICON.fileName,
    ...(FAVICON_MASKABLE_ICON
      ? [FAVICON_MASKABLE_ICON.fileName]
      : []),
    FAVICON_MS_TILE.fileName,
    FAVICON_BROWSERCONFIG.fileName,
    ...FAVICON_PNG_VARIANTS.map((item) => item.fileName),
    ...Object.values(FAVICON_WEB_MANIFESTS).map(
      (item) => item.fileName,
    ),
    FAVICON_DEFAULT_WEB_MANIFEST.fileName,
  ];

  const faviconsDir = path.resolve(
    process.cwd(),
    'public',
    'favicons',
  );
  const missingAssets: string[] = [];
  await Promise.all(
    assetsToVerify.map(async (fileName) => {
      try {
        await access(path.join(faviconsDir, fileName));
      } catch {
        missingAssets.push(fileName);
      }
    }),
  );

  const data = {
    svg: {
      src: FAVICON_SVG.src,
      fileName: FAVICON_SVG.fileName,
      hash: FAVICON_SVG.hash,
    },
    ico: {
      src: FAVICON_ICO.src,
      fileName: FAVICON_ICO.fileName,
      hash: FAVICON_ICO.hash,
    },
    pngVariants: FAVICON_PNG_VARIANTS,
    appleTouch: FAVICON_APPLE_TOUCH_ICON,
    androidIcons: FAVICON_ANDROID_ICONS,
    maskIcon: FAVICON_MASK_ICON,
    maskableIcon: FAVICON_MASKABLE_ICON,
    msTile: FAVICON_MS_TILE,
    browserConfig: FAVICON_BROWSERCONFIG,
    webManifest,
    defaultManifest: FAVICON_DEFAULT_WEB_MANIFEST,
    manifestMeta,
    themeColors: faviconThemeColors,
    metaTags: FAVICON_META_TAGS,
    linkDescriptors,
  };

  return (
    <FavIconPreview
      data={data}
      locale={locale}
      availableLocales={availableLocales}
      fallbackLocale={fallbackLocale}
      assetsReady={missingAssets.length === 0}
      missingAssets={missingAssets}
    />
  );
}
