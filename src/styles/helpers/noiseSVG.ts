import { m } from '../measurementKit';
import type { IMeasurement } from '../measurementKit';
import type * as CSS from 'csstype';
export interface NoiseSvgOptions {
	opacity?: number;
	baseFrequency?: number;
	numOctaves?: number;
	width?: IMeasurement;
	height?: IMeasurement;
}

export function createNoiseSvg(id: string, props?: NoiseSvgOptions) {
	const {
		opacity = 0.8,
		baseFrequency = 0.8,
		numOctaves = 2,
		width = m(60),
		height = m(60),
	} = props || {};

	return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width.css()}" height="${height.css()}">
        <filter id="${id}">
            <feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="${numOctaves}" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#${id})" opacity="${opacity}"/>
        </svg>
    `.trim();
}

export function noiseStyle(id: string, props?: NoiseSvgOptions) {
	return `url("data:image/svg+xml;utf8,${encodeURIComponent(createNoiseSvg(id, props))}")`;
}

export function noiseBg(props?: {
	backgroundRepeat?: CSS.Property.BackgroundRepeat;
	backgroundSize?: CSS.Property.BackgroundSize;
	mixBlendMode?: CSS.Property.MixBlendMode;
	opacity?: CSS.Property.Opacity;
}) {
	const {
		backgroundRepeat = 'repeat',
		backgroundSize = '240px 240px',
		mixBlendMode = 'overlay',
		opacity = '0.03',
	} = props || {};
	return {
		backgroundRepeat,
		backgroundSize,
		mixBlendMode,
		opacity,
	};
}
