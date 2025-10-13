import { color } from '@/styles/helpers/colorWrap';
import type * as CSS from 'csstype';
import { glassVars } from './glassy';
import { m } from './measurement';
import { colorVars } from '../vars';

/**
 * Arch-specific glass settings derived from the shared glass variables while
 * keeping the nav look separate from generic panels.
 */
export const archGlassVars = {
	backgroundColor: glassVars.backgroundColor,
	surfaceGlowPrimaryTint: glassVars.surfaceGlowPrimaryTint,
	surfaceGlowSecondaryTint: glassVars.surfaceGlowSecondaryTint,
	innerBorderColor: glassVars.innerBorderColor,
	backdropBlur: glassVars.backdropBlur, // IMeasurement
	noiseDataUri: glassVars.noiseDataUri(),
	overlay: {
		color: colorVars.white,
		topAlpha: 0.05,
		midStop: '45%',
		bottomAlpha: 0.2,
		direction: m(180, 'deg'),
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
		color: color('#ffffff'),
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
} => {
	// Ensure a tiny alpha so Safari renders backdrop-filter
	const baseAlpha = archGlassVars.backgroundColor.value().alpha(); // getter -> number
	const ensuredBg = archGlassVars.backgroundColor.alpha(
		Math.max(baseAlpha || 0, 0.01),
	);

	const overlay = `linear-gradient(${archGlassVars.overlay.direction.css()}, ${archGlassVars.overlay.color
		.alpha(archGlassVars.overlay.topAlpha)
		.css()} 0%, ${archGlassVars.overlay.color.alpha(0).css()} ${
		archGlassVars.overlay.midStop
	}, ${archGlassVars.overlay.color.alpha(archGlassVars.overlay.bottomAlpha).css()} 100%)`;

	const glow = `linear-gradient(180deg, ${archGlassVars.surfaceGlowPrimaryTint.css()}, ${archGlassVars.surfaceGlowSecondaryTint.css()})`;

	return {
		background: [overlay, glow, ensuredBg.css()].join(', '),
		backdropFilter: `blur(${archGlassVars.backdropBlur.css()})`,
		WebkitBackdropFilter:
			`blur(${archGlassVars.backdropBlur.css()})` as CSS.Property.BackdropFilter,
	};
};
