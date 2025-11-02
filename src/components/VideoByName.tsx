import type { ReactElement } from 'react';
import { getVideo } from '@/lib/videos';
import type { ImageEntry } from '@/lib/images';
import { getImage } from '@/lib/images';
import VideoByNameClient from './VideoByName.client';
import type {
	PosterImagePayload,
	VideoByNameProps,
} from './VideoByName.types';

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
	let preconnectHref: string | null = null;
	if (typeof video.masterUrl === 'string' && video.masterUrl.startsWith('http')) {
		try {
			preconnectHref = new URL(video.masterUrl).origin;
		} catch {
			preconnectHref = null;
		}
	}

	return (
		<>
			{preconnectHref ? (
				<link rel="preconnect" href={preconnectHref} crossOrigin="anonymous" />
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
