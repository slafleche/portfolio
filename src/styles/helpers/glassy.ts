import { colorVars, type IBorder } from '../vars';
import { color } from '@/styles/helpers/colorWrap';
import { m } from './measurement';
import type * as CSS from 'csstype';
import { noiseStyle, type NoiseSvgOptions } from './noiseSVG';

const defaultNoiseId = `glassy-noise-${Math.random().toString(36).slice(2, 10)}`;

export const glassNoise = (
	id: string = defaultNoiseId,
	props?: NoiseSvgOptions,
) => noiseStyle(id, props);

export const glassVars = {
	backgroundColor: colorVars.white.alpha(0.06),
	// surfaceGlowPrimaryTint: chroma('hsl(210, 80%, 70%)').alpha(0.1),
	// surfaceGlowSecondaryTint: chroma('hsl(280, 80%, 70%)').alpha(0.14),
	surfaceGlowPrimaryTint: color('#0f0c18').alpha(0.5),
	surfaceGlowSecondaryTint: color('#0f0c18').alpha(0.14),
	frameBorderColor: colorVars.white.alpha(0.15),
	innerBorderColor: colorVars.white.alpha(0.12),
	backdropBlur: m(15),
	border: {
		radius: m(100), // border Radius
		width: m(8),
	},
	// Specular highlight in the top left corner
	outerBorderHighlight: {
		strength: 0.35,
		spread: m(100, '%'),
		angle: m(95, 'deg'),
	},
	// Blur effect
	surfaceGlow: {
		blur: m(12),
		opacity: 0.1,
		primaryTintAlpha: 0.25,
		secondaryTintAlpha: 0.25,
	},
	// Slight gradient overlay
	overlay: {
		color: colorVars.black,
		topAlpha: 0.05,
		midStop: '45%',
		bottomAlpha: 0.1,
		direction: m(-45, 'deg'),
	},
	// Kind of "background" color
	innerBorderHighlight: {
		radialStrength: 0.45,
		wedgeStrength: 0.9,
		opacity: 0.45,
	},
	/** Shared noise texture for glass surfaces (uses a default id) */
	noiseDataUri: () => glassNoise(),
	/** Unique filter id embedded in the default noise texture */
	noiseFilterId: defaultNoiseId,
};

export const glossyBorder = {
	base: {
		// radius: glassVars.border.radius.add(glassVars.border.width),
		color: colorVars.transparent,
	} satisfies IBorder,
};

export const createGlassBackground = (): {
	background: CSS.Property.Background<string>;
	backdropFilter: CSS.Property.BackdropFilter;
	WebkitBackdropFilter: CSS.Property.BackdropFilter;
} => ({
	background: [
		`linear-gradient(${glassVars.overlay.direction.css()}, ${glassVars.overlay.color
			.alpha(glassVars.overlay.topAlpha)
			.css()}, ${glassVars.overlay.color.alpha(0).css()} ${glassVars.overlay.midStop}, ${glassVars.overlay.color
			.alpha(glassVars.overlay.bottomAlpha)
			.css()} 100%)`,
		`linear-gradient(135deg, ${glassVars.surfaceGlowPrimaryTint.css()}, ${glassVars.surfaceGlowSecondaryTint.css()})`,
		glassVars.backgroundColor.css(),
	].join(', '),
	backdropFilter: `blur(${glassVars.backdropBlur.css()})`,
	WebkitBackdropFilter:
		`blur(${glassVars.backdropBlur.css()})` as CSS.Property.BackdropFilter,
});
