import type { ReactElement, VideoHTMLAttributes } from 'react';
import type { VideoEntry } from '@/lib/videos';
import { getVideo } from '@/lib/videos';
import type { ImageEntry } from '@/lib/images';
import { getImage } from '@/lib/images';
import VideoByNameClient from './VideoByName.client';

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

function buildPosterPayload(image: ImageEntry | null): PosterImagePayload | null {
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
	const video = getVideo(name);
	if (!video) {
		return null;
	}

	const posterImage = buildPosterPayload(getImage(`video-${video.name}`));

	return (
		<VideoByNameClient
			video={video}
			videoName={name}
			posterImage={posterImage}
			{...rest}
		/>
	);
}
