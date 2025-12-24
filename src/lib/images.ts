import releaseManifest from '@/data/generated/release/images/manifest.images.gen.json';
import stagingManifest from '@/data/generated/_staging/images/manifest.images.gen.json';
import { getManifestTarget } from '@/lib/runtimeEnv';

export type Variant = {
  w: number;
  url: string;
};
export type ImageEntry = {
  name: string;
  hash?: string;
  basePath?: string;
  dirName?: string;
  width: number;
  height: number;
  aspect: number;
  blurDataURL: string;
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

const target = getManifestTarget();
const db = (target === 'release'
  ? releaseManifest
  : stagingManifest) as Record<string, ImageEntry>;

export function getImage(name: string): ImageEntry | null {
  return db[name] ?? null;
}
