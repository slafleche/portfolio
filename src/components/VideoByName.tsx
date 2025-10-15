'use client';

import * as React from 'react';
import { getVideo, type VideoEntry } from '@/lib/videos';
import { getImage } from '@/lib/images';
import ImageByName from './ImageByName';
import { useT } from '../lib/locales/useT';
import clsx from 'clsx';

// Strong types for the dynamic import
type HlsModule = typeof import('hls.js');
type HlsClass = HlsModule['default'];
type HlsInstance = InstanceType<HlsClass>;

type VideoKind = 'hero' | 'inline';

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & {
	name: string;
	label?: string;
	kind?: VideoKind;
	priority?: boolean;
	pauseWhenOffscreen?: boolean;
	playbackRate?: number;
	className?: string;
	contentClassName?: string;
	onReady?: (video: HTMLVideoElement, meta: VideoEntry) => void;
};

export default function VideoByName({
	name,
	title,
	label,
	kind = 'hero',
	style: incomingStyle,
	autoPlay = true,
	muted = true,
	loop = true,
	controls = false,
	playsInline = true,
	className,
	contentClassName,
	priority = false,
	pauseWhenOffscreen = true,
	playbackRate = 1,
	onReady,
	...videoProps
}: Props) {
	const data = getVideo(name);
	const posterImage = data ? getImage(`video-${data.name}`) : null;
	const ref = React.useRef<HTMLVideoElement | null>(null);
	const ioRef = React.useRef<IntersectionObserver | null>(null);
	const t = useT();
	const [
		shouldLoadVideo,
		setShouldLoadVideo,
	] = React.useState<boolean>(() => priority ?? false);
	const [
		isPosterVisible,
		setPosterVisible,
	] = React.useState(true);
	const [
		isVideoReady,
		setVideoReady,
	] = React.useState(false);

	React.useEffect(() => {
		setPosterVisible(true);
		setVideoReady(false);
	}, [
		name,
	]);

	React.useEffect(() => {
		if (!shouldLoadVideo) {
			setPosterVisible(true);
			setVideoReady(false);
		}
	}, [
		shouldLoadVideo,
	]);

	React.useEffect(() => {
		if (priority) return;
		if (typeof window === 'undefined') return;

		const enable = () => setShouldLoadVideo(true);

		if (document.readyState === 'complete') {
			enable();
			return;
		}

		window.addEventListener('load', enable, { once: true });
		return () => window.removeEventListener('load', enable);
	}, [
		priority,
	]);

	React.useEffect(() => {
		if (!shouldLoadVideo) return;
		const video = ref.current;
		if (!video || !data) return;

		const src = data.masterUrl;
		const canNative =
			video.canPlayType('application/vnd.apple.mpegurl') !== '';

		let hls: HlsInstance | null = null;
		let cancelled = false;
		video.defaultPlaybackRate = playbackRate;
		video.playbackRate = playbackRate;

		(async () => {
			try {
				if (canNative) {
					video.src = src;
				} else {
					// Type the dynamic import so nothing is `any`
					const mod: HlsModule = await import('hls.js');
					if (cancelled) return;

					const HlsCtor: HlsClass = mod.default;
					if (HlsCtor.isSupported()) {
						hls = new HlsCtor({
							enableWorker: true,
						});
						hls.loadSource(src);
						hls.attachMedia(video);
					} else {
						// last-resort: some browsers can still load the URL directly
						video.src = src;
					}
				}

				if (autoPlay || priority) {
					void video.play(); // intentionally ignore promise for ESLint
				}
				video.playbackRate = playbackRate;
				onReady?.(video, data);
			} catch {
				// swallow autoplay/HLS setup errors
			}
		})().catch(() => {
			// guard for no-floating-promises on the IIFE itself
		});

		if (pauseWhenOffscreen) {
			ioRef.current?.disconnect();
			const io = new IntersectionObserver(
				([
					entry,
				]: IntersectionObserverEntry[]) => {
					const el = ref.current;
					if (!el) return;
					if (entry.isIntersecting) {
						if (autoPlay) void el.play();
					} else {
						el.pause(); // sync
					}
				},
				{ threshold: 0.01 },
			);
			io.observe(video);
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
		name,
		data,
		autoPlay,
		pauseWhenOffscreen,
		onReady,
		priority,
		playbackRate,
		shouldLoadVideo,
	]);

	React.useEffect(() => {
		if (!shouldLoadVideo) return;
		const video = ref.current;
		if (!video) return;
		video.defaultPlaybackRate = playbackRate;
		video.playbackRate = playbackRate;
	}, [
		playbackRate,
		shouldLoadVideo,
	]);

	if (!data) return null;
	const posterSrc = posterImage?.blurDataURL ?? data.posterUrl;
	const posterSrcSet = posterImage?.variants.jpg?.length
		? posterImage.variants.jpg
				.slice()
				.sort((a, b) => a.w - b.w)
				.map((v) => `${v.url} ${v.w}w`)
				.join(', ')
		: undefined;
	const posterSizes =
		posterSrcSet !== undefined
			? kind === 'hero'
				? '(max-width: 768px) 100vw, 100vw'
				: '(max-width: 768px) 100vw, 50vw'
			: undefined;

	const {
		children: _ignoredChildren,
		onLoadedData: userOnLoadedData,
		onPlay: userOnPlay,
		...restVideoProps
	} = videoProps;
	// mark as used so it doesn't trigger no-unused-vars while still stripping from rest
	void _ignoredChildren;

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
		ariaHiddenValue === true ? '' : (label ?? title ?? t('hero-alt'));
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

	const posterStyle: React.CSSProperties = {
		...fillStyle,
		pointerEvents: 'none',
		opacity: isPosterVisible ? 1 : 0,
		transition: 'opacity 240ms ease',
	};

	const fallbackPosterStyle: React.CSSProperties = {
		...posterStyle,
		objectFit: 'cover',
	};

	const videoStyle: React.CSSProperties = {
		...fillStyle,
		objectFit: 'cover',
		opacity: shouldLoadVideo && isVideoReady ? 1 : 0,
		transition: 'opacity 240ms ease',
		visibility: shouldLoadVideo ? 'visible' : 'hidden',
	};

	return (
		<div
			className={clsx(className)}
			style={containerStyle}
			{...placeholderPassthrough}
		>
			{posterImage ? (
				<ImageByName
					style={posterStyle}
					name={`video-${data.name}`}
					className={contentClassName}
					alt={placeholderAlt}
					title={title}
					kind={kind === 'hero' ? 'lg' : 'md'}
					priority={priority}
					fit="cover"
				/>
			) : (
				<img
					className={contentClassName}
					style={fallbackPosterStyle}
					src={posterSrc}
					srcSet={posterSrcSet}
					sizes={posterSizes}
					alt={placeholderAlt}
					decoding="async"
					loading={priority ? 'eager' : 'lazy'}
				/>
			)}
			<video
				ref={ref}
				className={contentClassName}
				style={videoStyle}
				title={title}
				aria-label={label}
				poster={posterSrc}
				autoPlay={autoPlay}
				muted={muted}
				loop={loop}
				controls={controls}
				playsInline={playsInline}
				preload={priority ? 'auto' : 'metadata'}
				onLoadedData={(event) => {
					setVideoReady(true);
					requestAnimationFrame(() => {
						setPosterVisible(false);
					});
					userOnLoadedData?.(event);
				}}
				onPlay={(event) => {
					setVideoReady(true);
					requestAnimationFrame(() => {
						setPosterVisible(false);
					});
					userOnPlay?.(event);
				}}
				{...restVideoProps}
			>
				{t('error-video')}
			</video>
		</div>
	);
}
