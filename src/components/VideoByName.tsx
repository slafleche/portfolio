'use client';

import * as React from 'react';
import { getVideo, type VideoEntry } from '@/lib/videos';
import { getImage } from '@/lib/images';
import ImageByName from './ImageByName';

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
	contentWrapClassName?: string;
	visualItemClassName?: string;
	backgroundClassName?: string; // gradient element
	onReady?: (video: HTMLVideoElement, meta: VideoEntry) => void;
	errorMessage: string;
	fallbackLabel: string;
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
	contentWrapClassName,
	backgroundClassName,
	visualItemClassName,
	priority = false,
	pauseWhenOffscreen = true,
	playbackRate = 1,
	onReady,
	errorMessage,
	fallbackLabel,
	...videoProps
}: Props) {
	const data = getVideo(name);
	const posterImage = data ? getImage(`video-${data.name}`) : null;
	const ref = React.useRef<HTMLVideoElement | null>(null);
	const ioRef = React.useRef<IntersectionObserver | null>(null);
	const [
		shouldLoadVideo,
		setShouldLoadVideo,
	] = React.useState<boolean>(() => priority ?? false);
	const [
		isVideoReady,
		setVideoReady,
	] = React.useState(false);
	const [
		isPosterLoaded,
		setPosterLoaded,
	] = React.useState(false);

	React.useEffect(() => {
		setVideoReady(false);
		setPosterLoaded(false);
	}, [
		name,
	]);

	React.useEffect(() => {
		if (!shouldLoadVideo) {
			setVideoReady(false);
			// posterLoaded will flip when the new poster paints
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
					const mod: HlsModule = await import('hls.js');
					if (cancelled) return;

					const HlsCtor: HlsClass = mod.default;
					if (HlsCtor.isSupported()) {
						hls = new HlsCtor({ enableWorker: true });
						hls.loadSource(src);
						hls.attachMedia(video);
					} else {
						video.src = src;
					}
				}

				if (autoPlay || priority) {
					void video.play();
				}
				video.playbackRate = playbackRate;
				onReady?.(video, data);
			} catch {
				// swallow autoplay/HLS setup errors
			}
		})().catch(() => {});

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
						el.pause();
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
				} catch {}
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

	const videoStyles: React.CSSProperties = {
		...fillStyle,
	};

	const imageStyles: React.CSSProperties = {
		...fillStyle,
		opacity: isPosterLoaded ? 1 : 0,
		transition: 'opacity 240ms ease',
	};

	// Show gradient only after image or video is ready
	const showBackground = isPosterLoaded || isVideoReady;
	const backgroundStyle: React.CSSProperties = {
		...fillStyle,
		opacity: showBackground ? 1 : 0,
		transition: 'opacity 240ms ease',
		pointerEvents: 'none',
	};

	return (
		<div
			className={className}
			style={containerStyle}
			{...placeholderPassthrough}
		>
			{/* Gradient layer, only renders when video or image is loaded to avoid flashing */}
			<div className={backgroundClassName} style={backgroundStyle} />

			<div className={contentWrapClassName} style={imageStyles}>
				{posterImage ? (
					<ImageByName
						style={posterStyle}
						name={`video-${data.name}`}
						className={visualItemClassName}
						alt={placeholderAlt}
						title={title}
						kind={kind === 'hero' ? 'lg' : 'md'}
						priority={priority}
						fit="cover"
						onLoad={() => setPosterLoaded(true)}
					/>
				) : (
					<img
						style={posterStyle}
						src={posterSrc}
						srcSet={posterSrcSet}
						sizes={posterSizes}
						className={visualItemClassName}
						alt={placeholderAlt}
						decoding="async"
						loading={priority ? 'eager' : 'lazy'}
						onLoad={() => setPosterLoaded(true)}
					/>
				)}
			</div>

			{/* Video paints ASAP; no opacity on the video element */}
			<div className={contentWrapClassName} style={videoStyles}>
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
