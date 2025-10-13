'use client';
import * as React from 'react';
import { getImage, type ImageEntry } from '@/lib/images';

type ImageKind = 'auto' | 'sm' | 'md' | 'lg';

function inferKindByWidth(w: number): Exclude<ImageKind, 'auto'> {
	if (w <= 480) return 'sm'; // small sources → likely thumbnails/cards
	if (w <= 1280) return 'md'; // mid-size sources → content images
	return 'lg'; // large sources → hero-ish content
}

function sizesFor(
	kind: Exclude<ImageKind, 'auto'>,
	intrinsicW: number,
): string {
	switch (kind) {
		case 'sm':
			// Respect the *real* width for tiny assets to avoid over-downloading.
			return `${Math.min(intrinsicW, 360)}px`;
		case 'md':
			// Likely half-width on desktop, full on mobile.
			return '(max-width: 768px) 100vw, 50vw';
		case 'lg':
			// Large content/hero—still not assuming full-bleed; 60vw on desktop.
			return '(max-width: 768px) 100vw, 60vw';
	}
}

type Props = {
	name: string;
	alt: string;
	title?: string;
	/**
	 * Semantic size:
	 *
	 * - "auto" (default): inferred from manifest width
	 * - "sm" | "md" | "lg": override
	 */
	kind?: ImageKind;
	className?: string;
	width?: number;
	height?: number;
	fit?: React.CSSProperties['objectFit'];
	priority?: boolean;
};

export default function ImageByName({
	name,
	alt,
	title,
	kind = 'auto',
	className,
	width,
	height,
	fit = 'cover',
	priority = false,
}: Props) {
	const data = getImage(name);
	if (!data) return null;

	const toSrcSet = (arr?: ImageEntry['variants']['avif']) =>
		(arr ?? [])
			.slice()
			.sort((a, b) => a.w - b.w)
			.map((v) => `${v.url} ${v.w}w`)
			.join(', ');

	const resolvedKind = kind === 'auto' ? inferKindByWidth(data.width) : kind;
	const sizes = sizesFor(resolvedKind, data.width);

	const w = width ?? data.width;
	const h = height ?? data.height;

	return (
		<picture className={className}>
			{!!data.variants.avif?.length && (
				<source
					type="image/avif"
					srcSet={toSrcSet(data.variants.avif)}
					sizes={sizes}
				/>
			)}
			{!!data.variants.webp?.length && (
				<source
					type="image/webp"
					srcSet={toSrcSet(data.variants.webp)}
					sizes={sizes}
				/>
			)}
			<img
				alt={alt}
				title={title}
				src={data.original.url}
				srcSet={
					data.variants.jpg?.length ? toSrcSet(data.variants.jpg) : undefined
				}
				sizes={data.variants.jpg?.length ? sizes : undefined}
				width={w}
				height={h}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: fit,
					aspectRatio: !width && !height ? `${data.aspect}` : undefined,
				}}
				loading={priority ? 'eager' : 'lazy'}
				decoding="async"
				fetchPriority={priority ? 'high' : 'auto'}
			/>
		</picture>
	);
}
