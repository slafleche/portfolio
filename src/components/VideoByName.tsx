'use client';
import * as React from 'react';
import type { ReactElement } from 'react';
import type { VideoEntry } from '@/lib/videos';
import type { ImageEntry } from '@/lib/images';
import VideoByNameClient from './VideoByName.client';
import type {
  PosterImagePayload,
  VideoByNameProps,
} from './VideoByName.types';

const VIDEOS_MANIFEST_URL = '/cdn/manifest/videos.json';
const IMAGES_MANIFEST_URL = '/cdn/manifest/images.json';

let cachedVideosManifest: Record<string, VideoEntry> | null = null;
let cachedVideosPromise: Promise<Record<string, VideoEntry>> | null =
  null;

let cachedImagesManifest: Record<string, ImageEntry> | null = null;
let cachedImagesPromise: Promise<Record<string, ImageEntry>> | null =
  null;

const fetchVideosManifest = async (): Promise<
  Record<string, VideoEntry>
> => {
  if (cachedVideosManifest) return cachedVideosManifest;
  if (!cachedVideosPromise) {
    cachedVideosPromise = fetch(VIDEOS_MANIFEST_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load videos manifest (${response.status}).`,
          );
        }
        return (await response.json()) as Record<
          string,
          VideoEntry
        >;
      })
      .catch((error) => {
        cachedVideosPromise = null;
        throw error;
      });
  }
  cachedVideosManifest = await cachedVideosPromise;
  return cachedVideosManifest;
};

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
        return (await response.json()) as Record<
          string,
          ImageEntry
        >;
      })
      .catch((error) => {
        cachedImagesPromise = null;
        throw error;
      });
  }
  cachedImagesManifest = await cachedImagesPromise;
  return cachedImagesManifest;
};

const useVideosManifest = () => {
  const [
    manifest,
    setManifest,
  ] = React.useState<Record<string, VideoEntry> | null>(
    () => cachedVideosManifest,
  );

  React.useEffect(() => {
    let cancelled = false;
    if (manifest) return;
    fetchVideosManifest()
      .then((data) => {
        if (!cancelled) setManifest(data);
      })
      .catch(() => {
        if (!cancelled) setManifest({});
      });
    return () => {
      cancelled = true;
    };
  }, [
    manifest,
  ]);

  return manifest;
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
      })
      .catch(() => {
        if (!cancelled) setManifest({});
      });
    return () => {
      cancelled = true;
    };
  }, [
    manifest,
  ]);

  return manifest;
};

function buildPosterPayload(
  image: ImageEntry | null,
): PosterImagePayload | null {
  if (!image) return null;
  return {
    name: image.name,
    blurDataURL: image.blurDataURL,
    variants: image.variants,
    original: image.original,
  };
}

export default function VideoByName({
  name,
  ...rest
}: VideoByNameProps): ReactElement | null {
  const videosManifest = useVideosManifest();
  const imagesManifest = useImagesManifest();
  const video = videosManifest ? videosManifest[name] : undefined;
  if (!video) {
    return null;
  }

  const posterImage = buildPosterPayload(
    imagesManifest ? imagesManifest[`video-${video.name}`] ?? null : null,
  );
  let preconnectHref: string | null = null;
  if (
    typeof video.masterUrl === 'string' &&
    video.masterUrl.startsWith('http')
  ) {
    try {
      preconnectHref = new URL(video.masterUrl).origin;
    } catch {
      preconnectHref = null;
    }
  }

  return (
    <>
      {preconnectHref ? (
        <link
          rel="preconnect"
          href={preconnectHref}
          crossOrigin="anonymous"
        />
      ) : null}
      <VideoByNameClient
        video={video}
        videoName={name}
        posterImage={posterImage}
        {...rest}
      />
    </>
  );
}
