import type * as CSS from 'csstype';
import type { GlobalStyleRule } from '@vanilla-extract/css';
import { getImage } from '@/lib/images';

export interface IBackground {
	color?: CSS.Property.BackgroundColor;
	attachment?: CSS.Property.BackgroundAttachment;
	position?: CSS.Property.Position;
	repeat?: CSS.Property.BackgroundRepeat;
	size?: CSS.Property.BackgroundSize;
	image?: CSS.Property.BackgroundImage;
	fallbackImage?: CSS.Property.BackgroundImage;
	opacity?: CSS.Property.Opacity;
}

type Variant = {
	w: number;
	url: string;
};

/* ------------------------- manifest-driven widths ------------------------- */

function getAvailableWidths(name: string): number[] {
	const data = getImage(name);
	if (!data) return [];
	const widths = new Set<number>();
	const push = (arr?: Variant[]) =>
		arr?.forEach((v) => widths.add(v.w));
	push(data.variants.avif);
	push(data.variants.webp);
	push(data.variants.jpg);
	return Array.from(widths).sort((a, b) => a - b);
}

function pickNearestAtMost(
	list: Variant[] | undefined,
	target: number,
) {
	if (!list || list.length === 0) return undefined;
	const under = list
		.filter((v) => v.w <= target)
		.sort((a, b) => b.w - a.w);
	return (
		under[0] ??
		[
			...list,
		].sort((a, b) => a.w - b.w)[0]
	)?.url;
}

function buildImageSet(name: string, targetWidth: number) {
	const data = getImage(name);
	if (!data) {
		return {
			imageSet: undefined as string | undefined,
			fallback: undefined as string | undefined,
		};
	}

	const avif = pickNearestAtMost(data.variants.avif, targetWidth);
	const webp = pickNearestAtMost(data.variants.webp, targetWidth);
	const jpg = pickNearestAtMost(data.variants.jpg, targetWidth);
	const fallback = data.original.url; // always exists per your manifest

	const parts: string[] = [];
	if (avif) parts.push(`url("${avif}") type("image/avif")`);
	if (webp) parts.push(`url("${webp}") type("image/webp")`);
	if (jpg) parts.push(`url("${jpg}")`);
	if (fallback) parts.push(`url("${fallback}")`);

	return {
		imageSet: parts.length
			? `image-set(${parts.join(', ')})`
			: undefined,
		fallback,
	};
}

/* ------------------------------ public helpers --------------------------- */
/* Base background: no MQs, just a safe fallback from the smallest asset. */
export function backgroundFromManifest(
	name: string,
): GlobalStyleRule {
	const widths = getAvailableWidths(name);
	const fallbackWidth = widths[0] ?? Number.POSITIVE_INFINITY;
	const { fallback } = buildImageSet(name, fallbackWidth);

	return {
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		...(fallback
			? {
					backgroundImage: `url("${fallback}")`,
				}
			: {}),
	} satisfies GlobalStyleRule;
}

/* Override by explicit target width (compose in YOUR MQ/container queries). */
export function backgroundImageForWidth(
	name: string,
	targetWidth: number,
): GlobalStyleRule {
	const { imageSet } = buildImageSet(name, targetWidth);
	return imageSet ? { backgroundImage: imageSet } : {};
}

/* Step-based override across the manifest’s available widths (0..N). */
export function backgroundImageForStep(
	name: string,
	step: number,
): GlobalStyleRule {
	const widths = getAvailableWidths(name);
	if (widths.length === 0) return {};
	const idx = Math.max(0, Math.min(widths.length - 1, step));
	const { imageSet } = buildImageSet(name, widths[idx]);
	return imageSet ? { backgroundImage: imageSet } : {};
}

/* ----------------------------- misc utilities ---------------------------- */

export const getBackgroundImage = (
	image?: CSS.Property.BackgroundImage,
) => {
	if (!image) return undefined;
	if (image.startsWith('linear-gradient(')) return image;
	return `url(${image})`;
};

/* Typed helper you can safely spread into globalStyle(...) */
export const backgroundHelper = (
	props: IBackground,
): GlobalStyleRule => {
	const styles: GlobalStyleRule = {
		backgroundPosition: props.position ?? '50% 50%',
		backgroundRepeat: props.repeat ?? 'no-repeat',
		...(props.image
			? {
					backgroundImage: getBackgroundImage(props.image),
				}
			: {}),
	};
	if (props.size) styles.backgroundSize = props.size;
	if (props.color) styles.backgroundColor = props.color;
	if (props.attachment)
		styles.backgroundAttachment = props.attachment;
	if (props.opacity !== undefined) styles.opacity = props.opacity;
	return styles;
};

/* This one likely isn’t used with globalStyle; keep as a plain object shape. */
export const objectFitWithFallback = () => {
	return {
		position: 'absolute' as CSS.Property.Position,
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
				objectFit: 'cover' as CSS.Property.ObjectFit,
				objectPosition: 'center',
				height: '100% !important',
			},
		},
	};
};

export function fakeBackgroundFixed(): GlobalStyleRule {
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

export function centeredBackground(
	image: CSS.Property.BackgroundImage,
): GlobalStyleRule {
	return {
		backgroundSize: 'cover',
		backgroundPosition: '50% 50%',
		backgroundRepeat: 'no-repeat',
		backgroundImage: getBackgroundImage(image),
	} satisfies GlobalStyleRule;
}

// globalStyle('.Hero', {
//   ...backgroundFromManifest('hero-banner'),
//   '@media': {
//     [mqStrings.compact]: backgroundImageForStep('hero-banner', 2),
//     [mqStrings.fullSize]: backgroundImageForWidth('hero-banner', 1680),
//   },
// });
