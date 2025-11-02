import type { VideoHTMLAttributes } from 'react';
import type { VideoEntry } from '@/lib/videos';
import type { ImageEntry } from '@/lib/images';

export type VideoByNameProps = VideoHTMLAttributes<HTMLVideoElement> & {
	name: string;
	label?: string;
	kind?: 'hero' | 'inline';
	priority?: boolean;
	pauseWhenOffscreen?: boolean;
	playbackRate?: number;
	className?: string;
	contentWrapClassName?: string;
	visualItemClassName?: string;
	backgroundClassName?: string;
	onReady?: (video: HTMLVideoElement, meta: VideoEntry) => void;
	errorMessage: string;
	fallbackLabel: string;
};

export type PosterImagePayload = {
	name: string;
	blurDataURL: string;
	variants: ImageEntry['variants'];
	original: ImageEntry['original'];
};
