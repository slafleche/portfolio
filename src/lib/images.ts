import stagingManifest from '@/data/generated/_staging/images/manifest.images.gen.json' assert { type: 'json' };
import releaseManifest from '@/data/generated/release/images/manifest.images.gen.json' assert { type: 'json' };
import { getManifestTarget } from '@/lib/runtimeEnv';

export type Variant = {
  w: number;
  url: string;
};
export type SocialImageSize = '1200x630' | '1200x675';
export type ImageEntry = {
  name: string;
  hash?: string;
  basePath?: string;
  dirName?: string;
  width: number;
  height: number;
  aspect: number;
  blurDataURL: string;
  shareImage?: boolean;
  variants: {
    avif?: Variant[];
    webp?: Variant[];
    jpg?: Variant[];
  };
  original: {
    url: string;
    width: number;
    height: number;
  };
};

const manifestTarget = getManifestTarget();
const imagesManifest: Record<string, ImageEntry> =
  manifestTarget === 'release'
    ? (releaseManifest as Record<string, ImageEntry>)
    : (stagingManifest as Record<string, ImageEntry>);

export function getSocialImageByName(
  locale: string,
  size: SocialImageSize,
): string | null {
  const normalizedLocale = locale.toLowerCase();
  const name = `share-images-${normalizedLocale}-share-image-${size}.gen`;
  const entry = imagesManifest[name];
  if (!entry?.shareImage) return null;
  return entry.original?.url ?? null;
}
