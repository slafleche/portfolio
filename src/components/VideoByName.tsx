'use client';

import * as React from 'react';
import { getVideo, type VideoEntry } from '@/lib/videos';
import { useT } from '../lib/locales/useT';

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
	onReady?: (video: HTMLVideoElement, meta: VideoEntry) => void;
};

export default function VideoByName({
	name,
	title,
	label,
	kind = 'hero',
	className,
	style: incomingStyle,
	autoPlay = true,
	muted = true,
	loop = true,
	controls = false,
	playsInline = true,
	priority = false,
	pauseWhenOffscreen = true,
	playbackRate = 1,
	onReady,
	...videoProps
}: Props) {
	const data = getVideo(name);
	const ref = React.useRef<HTMLVideoElement | null>(null);
	const ioRef = React.useRef<IntersectionObserver | null>(null);
	const t = useT();
	const [shouldLoadVideo, setShouldLoadVideo] = React.useState<boolean>(
		() => priority ?? false,
	);

	const computedStyle: React.CSSProperties =
		kind === 'hero'
			? {
					width: '100%',
					height: '100vh',
					objectFit: 'cover',
					...(incomingStyle ?? {}),
				}
			: {
					width: '100%',
					height: 'auto',
					objectFit: 'cover',
					...(incomingStyle ?? {}),
				};

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
	}, [priority]);

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
	}, [playbackRate, shouldLoadVideo]);

	if (!data) return null;

	const { children: _ignoredChildren, ...restVideoProps } = videoProps;
	const ariaHiddenRaw =
		(restVideoProps as { [key: string]: unknown })['aria-hidden'] ??
		(restVideoProps as { [key: string]: unknown })['ariaHidden'];
	const ariaHiddenValue =
		ariaHiddenRaw === 'true'
			? true
			: ariaHiddenRaw === 'false'
				? false
				: (ariaHiddenRaw as boolean | undefined);
	const placeholderAlt =
		ariaHiddenValue === true
			? ''
			: label ?? title ?? t('hero-alt');

	if (!shouldLoadVideo) {
		return (
			<img
				className={className}
				style={computedStyle}
				src={data.posterUrl}
				alt={placeholderAlt}
				decoding="async"
				loading={priority ? 'eager' : 'lazy'}
				{...restVideoProps}
			/>
		);
	}

	return (
		<video
			ref={ref}
			className={className}
			style={computedStyle}
			title={title}
			aria-label={label}
			poster={data.posterUrl}
			autoPlay={autoPlay}
			muted={muted}
			loop={loop}
			controls={controls}
			playsInline={playsInline}
			preload={priority ? 'auto' : 'metadata'}
			{...restVideoProps}
		>
			{t('error-video')}
		</video>
	);
}
