import chroma from 'chroma-js';
import type * as CSS from 'csstype';
import { glassVars } from './glassy';
import { m } from './measurement';

/**
 * Arch-specific glass settings derived from the shared glass variables while
 * keeping the nav look separate from generic panels.
 */
export const archGlassVars = {
	backgroundColor: glassVars.backgroundColor,
	surfaceGlowPrimaryTint: glassVars.surfaceGlowPrimaryTint,
	surfaceGlowSecondaryTint: glassVars.surfaceGlowSecondaryTint,
	innerBorderColor: glassVars.innerBorderColor,
	backdropBlur: glassVars.backdropBlur,
	noiseDataUri: glassVars.noiseDataUri(),
	overlay: {
		...glassVars.overlay,
	},
	outerBorderHighlight: {
		...glassVars.outerBorderHighlight,
		width: m(3),
		strength: Math.min(1, glassVars.outerBorderHighlight.strength + 0.1),
	},
	innerBorderHighlight: {
		...glassVars.innerBorderHighlight,
		opacity: Math.min(1, glassVars.innerBorderHighlight.opacity + 0.1),
	},
	surfaceGlow: {
		...glassVars.surfaceGlow,
		opacity: Math.min(1, glassVars.surfaceGlow.opacity + 0.1),
	},
	border: {
		width: m(3),
		color: chroma('white'),
		hotspotPosition: 0.51,
		hotspotCoverage: 0.2,
		baseLeftAlpha: 0.1,
		baseMidAlpha: 0.3,
		peakAlpha: 0.3,
		baseRightAlpha: 0.2,
	},
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
		`linear-gradient(135deg, ${archGlassVars.surfaceGlowPrimaryTint.css()}, ${archGlassVars.surfaceGlowSecondaryTint.css()})`,
		archGlassVars.backgroundColor.css(),
	].join(', '),
	backdropFilter: `blur(${archGlassVars.backdropBlur.css()})`,
	WebkitBackdropFilter:
		`blur(${archGlassVars.backdropBlur.css()})` as CSS.Property.BackdropFilter,
});
