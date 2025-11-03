'use client';

import React, {
	memo,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import * as s from '@/styles/components/bokeh.css';
import { createDomId } from '../lib/dom';
import clsx from 'clsx';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import type { ColorWrapper } from '@/styles/helpers/colorWrap';
import { bokehVars } from '../styles/componentTokens/global.componentTokens';

// A simple, deterministic layout for ~10 circles.
// You can tweak cx, cy, r as you like.
type Blob = {
	cx: number;
	cy: number;
	r: number;
	group: 0 | 1;
};

const BLOBS: Blob[] = [
	{ cx: 18, cy: 20, r: 22, group: 0 },
	{ cx: 32, cy: 18, r: 18, group: 1 },
	{ cx: 48, cy: 24, r: 28, group: 0 },
	{ cx: 66, cy: 18, r: 20, group: 1 },
	{ cx: 78, cy: 28, r: 26, group: 0 },
	{ cx: 22, cy: 66, r: 26, group: 1 },
	{ cx: 40, cy: 72, r: 20, group: 0 },
	{ cx: 56, cy: 64, r: 24, group: 1 },
	{ cx: 72, cy: 74, r: 18, group: 0 },
	{ cx: 84, cy: 60, r: 22, group: 1 },
];

export type BokehOverlayProps = {
	/** One chroma color per blob; if fewer provided, they cycle */
	colors?: ColorWrapper[];
	/** Overall opacity of the overlay [0..1] */
	opacity?: number;
	/**
	 * CSS blend mode (e.g. 'screen' | 'overlay' | 'soft-light' |
	 * 'plus-lighter')
	 */
	blendMode?: React.CSSProperties['mixBlendMode'];
	/** Blur radius in CSS/SVG px (stdDeviation ~= blur/2) */
	blur?: number;
	/**
	 * Multiplier applied to blur for finer control (e.g., 0.5 for
	 * smaller blur)
	 */
	blurScale?: number;
	/** Multiplier applied to all circle radii (1 = as defined) */
	sizeScale?: number;
	className?: string;
};

let mountedOnce = false;

function BokehOverlay({
	colors = bokehVars.colors,
	opacity = bokehVars.opacity,
	blendMode = bokehVars.blendMode,
	blur = bokehVars.blur,
	blurScale = bokehVars.blurScale,
	sizeScale = bokehVars.sizeScale,
	className,
}: BokehOverlayProps) {
	const filterId = useMemo(() => createDomId('bokeh'), []);
	const { width, height } = useWindowSize();
	const [
		mounted,
		setMounted,
	] = useState(() => mountedOnce);
	const raf1 = useRef<number | null>(null);
	const raf2 = useRef<number | null>(null);
	const lastSize = useRef<{
		width: number;
		height: number;
	} | null>(null);

	// Fade-in on mount to avoid jarring first paint
	useEffect(() => {
		if (mountedOnce) return;

		raf1.current = requestAnimationFrame(() => {
			raf2.current = requestAnimationFrame(() => {
				mountedOnce = true;
				setMounted(true);
			});
		});
		return () => {
			if (raf1.current != null) cancelAnimationFrame(raf1.current);
			if (raf2.current != null) cancelAnimationFrame(raf2.current);
		};
	}, []);

	if (width != null && height != null) {
		lastSize.current = {
			width,
			height,
		};
	}

	const renderWidth = width ?? lastSize.current?.width ?? null;
	const renderHeight = height ?? lastSize.current?.height ?? null;

	// Precompute color strings
	const colorStrs = useMemo(
		() => colors.map((c) => c.css()),
		[
			colors,
		],
	);

	// Split blobs per group once (and keep hooks at top level)
	const blobs0 = useMemo(
		() => BLOBS.filter((b) => b.group === 0),
		[],
	);
	const blobs1 = useMemo(
		() => BLOBS.filter((b) => b.group === 1),
		[],
	);

	// Convert blur (CSS px) to viewBox units (0..100) and memoize
	const { stdDev, pad } = useMemo(() => {
		const minSidePx = Math.max(
			1,
			Math.min(renderWidth ?? 0, renderHeight ?? 0),
		);
		const baseUnits = minSidePx
			? (blur / minSidePx) * 100
			: blur / 10;
		const units = Math.max(0, baseUnits * blurScale);
		const stdDeviation = Math.max(0.5, units / 2);
		const padUnits = Math.max(8, stdDeviation * 8);
		return {
			stdDev: stdDeviation,
			pad: padUnits,
		};
	}, [
		renderWidth,
		renderHeight,
		blur,
		blurScale,
	]);

	return (
		<div
			className={clsx(s.overlay, className)}
			style={{
				opacity: mounted ? opacity : 0,
				mixBlendMode: blendMode,
				// isolate blending to this overlay so filter edges don't interact oddly
				isolation: 'isolate',
			}}
			aria-hidden
		>
			{mounted && renderWidth != null && renderHeight != null && (
				<svg
					className={s.svg}
					viewBox="0 0 100 100"
					preserveAspectRatio="xMidYMid slice"
					role="img"
					// avoid any clipping from the root svg box
					overflow="visible"
					// helps sub-pixel edges on some GPUs
					shapeRendering="geometricPrecision"
				>
					<defs>
						<filter
							id={filterId}
							filterUnits="userSpaceOnUse"
							x={-pad}
							y={-pad}
							width={100 + pad * 2}
							height={100 + pad * 2}
							colorInterpolationFilters="linearRGB"
							filterRes="512"
						>
							{/* Main blur */}
							<feGaussianBlur
								in="SourceGraphic"
								stdDeviation={stdDev}
								edgeMode="none"
								result="blur"
							/>
							{/* Noise used both for dithering and tiny spatial jitter to break bands */}
							<feTurbulence
								type="fractalNoise"
								baseFrequency="0.8"
								numOctaves="1"
								seed="2"
								result="noise"
							/>
							{/* Micro displacement to reduce residual band edges */}
							<feDisplacementMap
								in="blur"
								in2="noise"
								scale="0.3"
								xChannelSelector="R"
								yChannelSelector="G"
								result="jitter"
							/>
							{/* Very low-alpha noise for dithering */}
							<feColorMatrix
								in="noise"
								type="matrix"
								values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.02 0"
								result="noiseA"
							/>
							<feBlend in="jitter" in2="noiseA" mode="overlay" />
						</filter>
					</defs>

					{/* Two counter-rotating groups for a gentle parallax feel */}
					<g className={s.rotating} filter={`url(#${filterId})`}>
						{blobs0.map((b, i) => (
							<circle
								key={`g0-${i}`}
								cx={b.cx}
								cy={b.cy}
								r={b.r * sizeScale}
								// chroma -> CSS-safe string
								fill={colorStrs[i % colorStrs.length]}
								opacity={0.9}
							/>
						))}
					</g>

					<g
						className={s.rotatingSlow}
						style={{
							animationDirection: 'reverse',
						}}
						filter={`url(#${filterId})`}
					>
						{blobs1.map((b, i) => (
							<circle
								key={`g1-${i}`}
								cx={b.cx}
								cy={b.cy}
								r={b.r * sizeScale}
								fill={colorStrs[(i + 3) % colorStrs.length]}
								opacity={0.9}
							/>
						))}
					</g>
				</svg>
			)}
		</div>
	);
}

export default memo(BokehOverlay);
