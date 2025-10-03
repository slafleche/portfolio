import { colorVars, IBorder } from '../vars';
import chroma from 'chroma-js';
import { m } from './measurement';
import type * as CSS from 'csstype';
import { noiseStyle } from './noiseSVG';
import type { NoiseSvgOptions } from './noiseSVG';

const defaultNoiseId = `glassy-noise-${Math.random().toString(36).slice(2, 10)}`;

export const glassNoise = (
	id: string = defaultNoiseId,
	props?: NoiseSvgOptions,
) => noiseStyle(id, props);

/**
 * Glass panel layering overview
 *
 * SurfaceFill – base inset rectangle that carries the frosted gradient.
 * surfaceBorder – masked inner rim band (radial + conic wedge highlight).
 * surfaceShine – large blurred directional glow (screen blend). Rim – outermost
 * highlight ring hugging the frame.
 */
export const glassVars = {
	backgroundColor: colorVars.white.alpha(0.06),
	surfaceGlowPrimaryTint: chroma('hsl(210, 80%, 70%)').alpha(0.1),
	surfaceGlowSecondaryTint: chroma('hsl(280, 80%, 70%)').alpha(0.14),
	frameBorderColor: colorVars.white.alpha(0.25),
	innerBorderColor: colorVars.white.alpha(0.22),
	backdropBlur: m(15),
	frameRadius: m(32),
	width: m(4),
	outerBorderHighlight: {
		strength: 0.35,
		spread: m(72),
		angle: m(95, 'deg'),
		width: m(2),
		offset: m(0),
	},
	innerBorderHighlight: {
		radialStrength: 0.45,
		wedgeStrength: 0.9,
		opacity: 0.55,
	},
	surfaceGlow: {
		blur: m(12),
		opacity: 0.5,
		primaryTintAlpha: 0.35,
		secondaryTintAlpha: 0.25,
	},
	overlay: {
		/** Overlay color used for the subtle top-to-bottom wash */
		color: colorVars.white,
		/** Alpha at the top stop of the overlay gradient */
		topAlpha: 0.05,
		/** Midpoint stop for the overlay gradient */
		midStop: '45%',
		/** Alpha at the bottom stop of the overlay gradient */
		bottomAlpha: 0.2,
		/** Direction (in degrees) for the overlay gradient */
		direction: m(45, 'deg'),
	},
	/** Shared noise texture for glass surfaces (uses a default id) */
	noiseDataUri: () => glassNoise(),
	/** Unique filter id embedded in the default noise texture */
	noiseFilterId: defaultNoiseId,
};

export const glossyBorder = {
	base: {
		radius: glassVars.frameRadius.add(glassVars.width.value),
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
