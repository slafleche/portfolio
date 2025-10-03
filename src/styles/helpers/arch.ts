import chroma from 'chroma-js';
import type * as CSS from 'csstype';
import { glassVars } from './glassy';
import { m } from './measurement';

/**
 * Arch-specific glass settings derived from the shared glassVars but tweaked so
 * the nav can keep its original look.
 */
export const archGlassVars = {
	tint1: glassVars.tint1,
	tint2: glassVars.tint2,
	bg: glassVars.bg,
	blur: glassVars.blur,
	noiseDataUri: glassVars.noiseDataUri,
	width: m(3),
	border: {
		thickness: m(3),
		rimColor: chroma('white'),
		rimHotPosX: 0.51,
		rimHotCoverage: 0.2,
		rimBaseLeft: 0.1,
		rimBaseMid: 0.3,
		rimPeak: 0.3,
		rimBaseRight: 0.2,
	},
	overlay: {
		/** Overlay color used for the subtle top-to-bottom wash */
		color: chroma('white'),
		/** Alpha at the top stop of the overlay gradient */
		topAlpha: 0.05,
		/** Midpoint stop for the overlay gradient */
		midStop: '45%',
		/** Alpha at the bottom stop of the overlay gradient */
		bottomAlpha: 0.2,
		/** Direction (in degrees) for the overlay gradient */
		direction: m(45, 'deg'),
	},
	// innerHighlight: {
	// 	...glassVars.innerHighlight,
	// 	opacity: Math.min(1, glassVars.innerHighlight.opacity + 0.1),
	// },
	// surfaceGlow: {
	// 	...glassVars.surfaceGlow,
	// 	opacity: Math.min(1, glassVars.surfaceGlow.opacity + 0.1),
	// },
};

export const createArchGlassBackground = (): {
	background: CSS.Property.Background<string>;
	backdropFilter: CSS.Property.BackdropFilter;
	WebkitBackdropFilter: CSS.Property.BackdropFilter;
} => ({
	background: [
		`linear-gradient(${archGlassVars.overlay.direction.css()}, ${archGlassVars.overlay.color
			.alpha(archGlassVars.overlay.topAlpha)
			.css()}, ${archGlassVars.overlay.color.alpha(0).css()} ${archGlassVars.overlay.midStop}, ${archGlassVars.overlay.color
			.alpha(archGlassVars.overlay.bottomAlpha)
			.css()} 100%)`,
		`linear-gradient(135deg, ${archGlassVars.tint1.css()}, ${archGlassVars.tint2.css()})`,
		archGlassVars.bg.css(),
	].join(', '),
	backdropFilter: `blur(${archGlassVars.blur.css()})`,
	WebkitBackdropFilter:
		`blur(${archGlassVars.blur.css()})` as CSS.Property.BackdropFilter,
});
