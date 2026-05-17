'use client';

import * as React from 'react';

import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import type { VideoEntry } from '@/lib/videos';

import type {
  PosterImagePayload,
  VideoByNameProps,
} from './VideoByName.types';

type ClientProps = Omit<VideoByNameProps, 'name'> & {
  video: VideoEntry;
  videoName: string;
  posterImage: PosterImagePayload | null;
};

type PosterVariants = PosterImagePayload['variants'];

function buildSrcSet(
  variants?: PosterVariants[keyof PosterVariants],
) {
  return variants && variants.length
    ? variants
        .slice()
        .sort((a, b) => a.w - b.w)
        .map((variant) => `${variant.url} ${variant.w}w`)
        .join(', ')
    : undefined;
}

export default function VideoByNameClient({
  video,
  videoName,
  label,
  title,
  kind = 'hero',
  style: incomingStyle,
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  playsInline = true,
  className,
  contentWrapClassName,
  backgroundClassName,
  visualItemClassName,
  priority = false,
  pauseWhenOffscreen = true,
  playbackRate = 1,
  onReady,
  errorMessage,
  fallbackLabel,
  posterImage,
  ...videoProps
}: ClientProps) {
  const ref = React.useRef<HTMLVideoElement | null>(null);
  const ioRef = React.useRef<IntersectionObserver | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { layoutTick } = useWindowSize();
  const [
    hasIntersected,
    setHasIntersected,
  ] = React.useState(false);
  const shouldLoadVideo = priority || hasIntersected;
  const [
    isVideoReady,
    setVideoReady,
  ] = React.useState(false);
  const [
    isPosterLoaded,
    setPosterLoaded,
  ] = React.useState(false);

  const [
    prevVideoName,
    setPrevVideoName,
  ] = React.useState(videoName);
  if (prevVideoName !== videoName) {
    setPrevVideoName(videoName);
    setVideoReady(false);
    setPosterLoaded(false);
  }

  const [
    prevShouldLoadVideo,
    setPrevShouldLoadVideo,
  ] = React.useState(shouldLoadVideo);
  if (prevShouldLoadVideo !== shouldLoadVideo) {
    setPrevShouldLoadVideo(shouldLoadVideo);
    if (!shouldLoadVideo) {
      setVideoReady(false);
    }
  }

  React.useEffect(() => {
    if (priority) return;
    if (shouldLoadVideo) return;
    if (typeof window === 'undefined') return;
    const target = containerRef.current;
    if (!target) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (cancelled) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasIntersected(true);
            observer.disconnect();
            return;
          }
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.01,
      },
    );
    observer.observe(target);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [
    layoutTick,
    priority,
    shouldLoadVideo,
  ]);

  React.useEffect(() => {
    if (!shouldLoadVideo) return;
    const videoEl = ref.current;
    if (!videoEl) return;

    const src = video.masterUrl;
    const canNative =
      videoEl.canPlayType('application/vnd.apple.mpegurl') !== '';

    let hls: InstanceType<
      (typeof import('hls.js'))['default']
    > | null = null;
    let cancelled = false;
    videoEl.defaultPlaybackRate = playbackRate;
    videoEl.playbackRate = playbackRate;

    (async () => {
      try {
        if (canNative) {
          videoEl.src = src;
        } else {
          const mod = await import('hls.js');
          if (cancelled) return;
          const HlsCtor = mod.default;
          if (HlsCtor.isSupported()) {
            hls = new HlsCtor({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(videoEl);
          } else {
            videoEl.src = src;
          }
        }

        if (autoPlay || priority) {
          void videoEl.play();
        }
        videoEl.playbackRate = playbackRate;
        onReady?.(videoEl, video);
      } catch {
        // Swallow autoplay/HLS setup errors.
      }
    })().catch(() => {});

    if (pauseWhenOffscreen) {
      ioRef.current?.disconnect();
      const io = new IntersectionObserver(
        ([
          entry,
        ]) => {
          const el = ref.current;
          if (!el) return;
          if (entry.isIntersecting) {
            if (autoPlay) void el.play();
          } else {
            el.pause();
          }
        },
        { threshold: 0.01 },
      );
      io.observe(videoEl);
      ioRef.current = io;
    }

    return () => {
      cancelled = true;
      ioRef.current?.disconnect();
      ioRef.current = null;
      if (hls) {
        try {
          hls.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [
    video,
    videoName,
    autoPlay,
    pauseWhenOffscreen,
    onReady,
    priority,
    playbackRate,
    shouldLoadVideo,
    layoutTick,
  ]);

  React.useEffect(() => {
    if (!shouldLoadVideo) return;
    const videoEl = ref.current;
    if (!videoEl) return;
    videoEl.defaultPlaybackRate = playbackRate;
    videoEl.playbackRate = playbackRate;
  }, [
    playbackRate,
    shouldLoadVideo,
  ]);

  const posterSrc =
    posterImage?.blurDataURL && posterImage.blurDataURL.length > 0
      ? posterImage.blurDataURL
      : video.posterUrl;

  const posterSrcSet = buildSrcSet(posterImage?.variants.jpg);
  const avifSrcSet = buildSrcSet(posterImage?.variants.avif);
  const webpSrcSet = buildSrcSet(posterImage?.variants.webp);
  const originalPosterUrl =
    posterImage?.original.url ?? video.posterUrl;

  const posterSizes =
    posterSrcSet !== undefined
      ? kind === 'hero'
        ? '(max-width: 768px) 100vw, 100vw'
        : '(max-width: 768px) 100vw, 50vw'
      : undefined;

  const {
    onLoadedData: userOnLoadedData,
    onPlay: userOnPlay,
    ...restVideoProps
  } = videoProps;

  const rawAttrs = restVideoProps as Record<string, unknown>;
  const ariaHiddenRaw =
    rawAttrs['aria-hidden'] ?? rawAttrs['ariaHidden'];
  const ariaHiddenValue =
    ariaHiddenRaw === 'true'
      ? true
      : ariaHiddenRaw === 'false'
        ? false
        : (ariaHiddenRaw as boolean | undefined);
  const placeholderAlt =
    ariaHiddenValue === true ? '' : (label ?? title ?? fallbackLabel);
  const placeholderPassthrough = Object.fromEntries(
    Object.entries(rawAttrs).filter(
      ([
        key,
      ]) =>
        key.startsWith('data-') ||
        key.startsWith('aria-') ||
        key === 'id' ||
        key === 'role',
    ),
  );

  const containerStyle: React.CSSProperties =
    kind === 'hero'
      ? {
          overflow: 'hidden',
          ...(incomingStyle ?? {}),
        }
      : {
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          ...(incomingStyle ?? {}),
        };

  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  };

  const videoStyle: React.CSSProperties = {
    ...fillStyle,
    objectFit: 'cover',
  };

  const posterStyle: React.CSSProperties = {
    ...fillStyle,
    objectFit: 'cover',
    pointerEvents: 'none',
  };

  const posterContainerStyle: React.CSSProperties = {
    ...fillStyle,
    opacity: isPosterLoaded ? 1 : 0,
    transition: 'opacity 240ms ease',
  };

  const backgroundStyle: React.CSSProperties = {
    ...fillStyle,
    opacity: isPosterLoaded || isVideoReady ? 1 : 0,
    transition: 'opacity 240ms ease',
    pointerEvents: 'none',
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      {...placeholderPassthrough}
    >
      <div className={backgroundClassName} style={backgroundStyle} />

      <div
        className={contentWrapClassName}
        style={posterContainerStyle}
      >
        {posterImage ? (
          <picture>
            {avifSrcSet ? (
              <source
                type="image/avif"
                srcSet={avifSrcSet}
                sizes={posterSizes}
              />
            ) : null}
            {webpSrcSet ? (
              <source
                type="image/webp"
                srcSet={webpSrcSet}
                sizes={posterSizes}
              />
            ) : null}
            {posterSrcSet ? (
              <source
                type="image/jpeg"
                srcSet={posterSrcSet}
                sizes={posterSizes}
              />
            ) : null}
            <img
              style={posterStyle}
              src={originalPosterUrl}
              srcSet={posterSrcSet}
              sizes={posterSizes}
              className={visualItemClassName}
              alt={placeholderAlt}
              title={title}
              decoding="async"
              loading={priority ? 'eager' : 'lazy'}
              onLoad={() => setPosterLoaded(true)}
            />
          </picture>
        ) : (
          <img
            style={posterStyle}
            src={posterSrc}
            srcSet={posterSrcSet}
            sizes={posterSizes}
            className={visualItemClassName}
            alt={placeholderAlt}
            title={title}
            decoding="async"
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setPosterLoaded(true)}
          />
        )}
      </div>

      <div className={contentWrapClassName} style={fillStyle}>
        <video
          ref={ref}
          style={videoStyle}
          title={title}
          aria-label={label}
          poster={posterSrc}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline={playsInline}
          className={visualItemClassName}
          preload={priority ? 'auto' : 'metadata'}
          onLoadedData={(event) => {
            setVideoReady(true);
            userOnLoadedData?.(event);
          }}
          onPlay={(event) => {
            setVideoReady(true);
            userOnPlay?.(event);
          }}
          {...restVideoProps}
        >
          {errorMessage}
        </video>
      </div>
    </div>
  );
}
