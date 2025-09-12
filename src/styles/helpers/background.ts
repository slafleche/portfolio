import * as csstype from 'csstype';
import { getImage } from '@/lib/images';

export interface IBackground {
	color?: csstype.Property.BackgroundColor;
	attachment?: csstype.Property.BackgroundAttachment;
	position?: csstype.Property.Position;
	repeat?: csstype.Property.BackgroundRepeat;
	size?: csstype.Property.BackgroundSize;
	image?: csstype.Property.BackgroundImage;
	fallbackImage?: csstype.Property.BackgroundImage;
	opacity?: csstype.Property.Opacity;
}

type Variant = { w: number; url: string };
// background.ts (add this)
type BgKind = 'hero' | 'section' | 'cardBg';

// Rework to use mediaQueries
const bgTargets: Record<BgKind, { mobile: number; desktop: number }> = {
	hero: { mobile: 640, desktop: 1400 },
	section: { mobile: 640, desktop: 1100 },
	cardBg: { mobile: 360, desktop: 600 },
};

/**
 * Build background styles from manifest by name, with fallback and image-set.
 * Usage: style(backgroundFromManifest("hero-banner", "hero"))
 */
export function backgroundFromManifest(name: string, kind: BgKind = 'section') {
	const { mobile, desktop } = bgTargets[kind];
	const m = buildImageSet(name, mobile);
	const d = buildImageSet(name, desktop);

	const base: Record<string, any> = {
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
	};

	// Fallback first (works everywhere)
	if (m.fallback) {
		base.backgroundImage = `url("${m.fallback}")`;
	}

	// Progressive enhancement: overwrite with image-set in MQs
	base['@media'] = {
		'(max-width: 767px)': m.imageSet ? { backgroundImage: m.imageSet } : {},
		'(min-width: 768px)': d.imageSet
			? { backgroundImage: d.imageSet }
			: m.imageSet
				? { backgroundImage: m.imageSet }
				: {},
	};

	return base;
}

function pickNearestAtMost(list: Variant[] | undefined, target: number) {
	if (!list || list.length === 0) return undefined;
	const under = list.filter((v) => v.w <= target).sort((a, b) => b.w - a.w);
	return (under[0] ?? [...list].sort((a, b) => a.w - b.w)[0])?.url;
}

function buildImageSet(name: string, targetWidth: number) {
	const data = getImage(name);
	if (!data)
		return {
			imageSet: undefined as string | undefined,
			fallback: undefined as string | undefined,
		};

	const avif = pickNearestAtMost(data.variants.avif, targetWidth);
	const webp = pickNearestAtMost(data.variants.webp, targetWidth);
	const jpg = pickNearestAtMost(data.variants.jpg, targetWidth);
	const fallback = data.original.url; // always exists

	const parts: string[] = [];
	if (avif) parts.push(`url("${avif}") type("image/avif")`);
	if (webp) parts.push(`url("${webp}") type("image/webp")`);
	if (jpg) parts.push(`url("${jpg}")`);

	// include fallback at the end of image-set for extra safety
	if (fallback) parts.push(`url("${fallback}")`);

	return {
		imageSet: parts.length ? `image-set(${parts.join(', ')})` : undefined,
		fallback,
	};
}

export const getBackgroundImage = (
	image?: csstype.Property.BackgroundImage,
) => {
	if (!image) {
		return undefined;
	}

	if (image.startsWith('linear-gradient(')) {
		return image;
	}

	// Fallback to a general asset URL.
	return `url(${image})`;
};

export const backgroundHelper = (props: IBackground) => {
	const styles = {
		backgroundPosition: props.position || `50% 50%`,
		backgroundRepeat: props.repeat || 'no-repeat',
		backgroundImage: getBackgroundImage(props.image),
	} as any;

	if (props.size) {
		styles.backgroundSize = props.size as csstype.Property.BackgroundSize;
	}

	if (props.color) {
		styles.backgroundColor = props.color as csstype.Property.BackgroundColor;
	}

	if (props.attachment) {
		styles.backgroundAttachment =
			props.attachment as csstype.Property.BackgroundAttachment;
	}

	if (props.opacity) {
		styles.opacity = props.opacity as csstype.Property.Opacity;
	}

	return styles;
};

export const objectFitWithFallback = () => {
	return {
		position: 'absolute' as csstype.Property.Position,
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		margin: 'auto',
		height: 'auto',
		width: '100%',
		$nest: {
			'@supports (object-fit: cover)': {
				position: 'relative !important',
				objectFit: 'cover' as csstype.Property.ObjectFit,
				objectPosition: 'center',
				height: '100% !important',
			},
		},
	};
};

export function fakeBackgroundFixed() {
	return {
		content: '',
		display: 'block',
		position: 'fixed',
		top: '0px',
		left: '0px',
		width: '100vw',
		height: '100vh',
	};
}

export function centeredBackground(image: csstype.Property.BackgroundImage) {
	return {
		backgroundSize: 'cover',
		backgroundPosition: `50% 50%`,
		backgroundRepeat: 'no-repeat',
		backgroundImage: getBackgroundImage(image),
	};
}
