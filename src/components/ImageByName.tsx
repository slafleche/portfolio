'use client';
import * as React from 'react';
import type { ImageEntry } from '@/lib/images';
import clsx from 'clsx';
import * as s from '@/styles/components/imageByName.css';

const IMAGES_MANIFEST_URL = '/cdn/manifest/images.json';
let cachedImagesManifest: Record<string, ImageEntry> | null = null;
let cachedImagesPromise: Promise<Record<string, ImageEntry>> | null =
  null;

const fetchImagesManifest = async (): Promise<
  Record<string, ImageEntry>
> => {
  if (cachedImagesManifest) return cachedImagesManifest;
  if (!cachedImagesPromise) {
    cachedImagesPromise = fetch(IMAGES_MANIFEST_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load images manifest (${response.status}).`,
          );
        }
        return (await response.json()) as Record<string, ImageEntry>;
      })
      .catch((error) => {
        cachedImagesPromise = null;
        throw error;
      });
  }
  cachedImagesManifest = await cachedImagesPromise;
  return cachedImagesManifest;
};

const useImagesManifest = () => {
  const [
    manifest,
    setManifest,
  ] = React.useState<Record<string, ImageEntry> | null>(
    () => cachedImagesManifest,
  );

  React.useEffect(() => {
    let cancelled = false;
    if (manifest) return;
    fetchImagesManifest()
      .then((data) => {
        if (!cancelled) setManifest(data);
        return data;
      })
      .catch(() => {
        if (!cancelled) setManifest({});
        return undefined;
      });
    return () => {
      cancelled = true;
    };
  }, [
    manifest,
  ]);

  return manifest;
};

type ImageSize = 'auto' | 'sm' | 'md' | 'lg';

function inferSizeByWidth(w: number): Exclude<ImageSize, 'auto'> {
  if (w <= 480) return 'sm'; // small sources → likely thumbnails/cards
  if (w <= 1280) return 'md'; // mid-size sources → content images
  return 'lg'; // large sources → hero-ish content
}

function sizesFor(
  size: Exclude<ImageSize, 'auto'>,
  intrinsicW: number,
): string {
  switch (size) {
    case 'sm':
      // Respect the *real* width for tiny assets to avoid over-downloading.
      return `${Math.min(intrinsicW, 360)}px`;
    case 'md':
      // Likely half-width on desktop, full on mobile.
      return '(max-width: 768px) 100vw, 50vw';
    case 'lg':
      // Large content/hero—still not assuming full-bleed; 60vw on desktop.
      return '(max-width: 768px) 100vw, 60vw';
    default:
      return '(max-width: 768px) 100vw, 60vw';
  }
}

type Props = {
  name: string;
  alt: string;
  title?: string;
  /**
   * Semantic size:
   *
   * - "auto" (default): inferred from manifest width
   * - "sm" | "md" | "lg": override
   */
  size?: ImageSize;
  className?: string;
  width?: number;
  height?: number;
  fit?: React.CSSProperties['objectFit'];
  priority?: boolean;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
};

export default function ImageByName({
  name,
  alt,
  title,
  size = 'auto',
  className,
  width,
  height,
  fit = 'cover',
  priority = false,
  onLoad,
}: Props) {
  const manifest = useImagesManifest();
  const data = manifest ? (manifest[name] ?? null) : null;
  if (!data) return null;

  const toSrcSet = (arr?: ImageEntry['variants']['avif']) =>
    (arr ?? [])
      .slice()
      .sort((a, b) => a.w - b.w)
      .map((v) => `${v.url} ${v.w}w`)
      .join(', ');

  const resolvedSize =
    size === 'auto' ? inferSizeByWidth(data.width) : size;
  const sizes = sizesFor(resolvedSize, data.width);

  const w = width ?? data.width;
  const h = height ?? data.height;

  return (
    <picture className={clsx(className, s.root)}>
      {!!data.variants.avif?.length && (
        <source
          type="image/avif"
          srcSet={toSrcSet(data.variants.avif)}
          sizes={sizes}
        />
      )}
      {!!data.variants.webp?.length && (
        <source
          type="image/webp"
          srcSet={toSrcSet(data.variants.webp)}
          sizes={sizes}
        />
      )}
      <img
        alt={alt}
        title={title}
        src={data.original.url}
        srcSet={
          data.variants.jpg?.length
            ? toSrcSet(data.variants.jpg)
            : undefined
        }
        sizes={data.variants.jpg?.length ? sizes : undefined}
        width={w}
        height={h}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: fit,
          aspectRatio:
            !width && !height ? `${data.aspect}` : undefined,
        }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={onLoad}
      />
    </picture>
  );
}
