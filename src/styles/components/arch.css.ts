import { keyframes, style } from '@vanilla-extract/css';
import { absolutePosition } from '../helpers/positioning';
import { colorVars, dropShadowVars } from '../vars';
import { createArchGlassBackground } from '../helpers/arch';
import { noiseBg } from '../helpers/noiseSVG';

export const root = style({
	position: 'relative',
	overflow: 'visible',
	display: 'block',
});

export const svg = style({
	overflow: 'visible',
	position: 'relative',
	zIndex: 1, // keep rim stroke above the glass layer
});

export const shadow = style({
	...absolutePosition.topLeft(),
	// Give extra room so the blurred, offset shadow doesn’t clip
	width: `100%`,
	height: `100%`,
	pointerEvents: 'none',
	filter: `blur(${dropShadowVars.blur.css()})`,
});

const glowBaseColor = dropShadowVars.color.mix(colorVars.contrast, 10);
const glowFillColor = dropShadowVars.color.mix(colorVars.contrast, 80);
const gentleGlowFilter = `drop-shadow(0 0 14px ${glowBaseColor.css()}) drop-shadow(0 0 32px ${glowFillColor.css()})`;

const logoGlow = keyframes({
	'0%': {
		filter: `drop-shadow(0 0 0 ${glowBaseColor.css()})`,
		fill: dropShadowVars.color.css(),
	},
	'15%': {
		filter: `drop-shadow(0 0 14px ${glowBaseColor.css()}) drop-shadow(0 0 32px ${glowFillColor.css()})`,
		fill: glowFillColor.css(),
	},
	'20%': {
		filter: `drop-shadow(0 0 10px ${glowBaseColor.css()}) drop-shadow(0 0 22px ${glowFillColor.css()})`,
		fill: dropShadowVars.color.mix(colorVars.contrast, 40).css(),
	},
	'100%': {
		filter: `drop-shadow(0 0 0 ${dropShadowVars.color.css()})`,
		fill: dropShadowVars.color.css(),
	},
});

export const shadowPath = style({
	fill: dropShadowVars.color.css(),
	willChange: 'filter, fill',
	selectors: {
		'[data-logo-glow="pulse"] &': {
			animation: `${logoGlow} 800ms ease-out`,
		},
		'[data-logo-glow="hold"] &': {
			animation: 'none',
			filter: gentleGlowFilter,
			fill: glowFillColor.css(),
		},
	},
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			selectors: {
				'[data-logo-glow="pulse"] &': {
					animation: 'none',
					filter: gentleGlowFilter,
					fill: glowFillColor.css(),
				},
				'[data-logo-glow="hold"] &': {
					animation: 'none',
					filter: gentleGlowFilter,
					fill: glowFillColor.css(),
				},
			},
		},
	},
});

const baseGlass = createArchGlassBackground();
const archOverlayGradient = `linear-gradient(180deg,
  ${colorVars.white.alpha(0.14).css()} 0%,
  ${colorVars.white.alpha(0.05).css()} 28%,
  ${colorVars.black.alpha(0.06).css()} 82%,
  ${colorVars.black.alpha(0.12).css()} 100%)`;

/**
 * The glass effect now lives on an absolutely positioned HTML element that is
 * clipped to the SVG path via style clipPath: url(#clipPathId).
 */
export const surface = style({
	position: 'absolute',
	inset: 0,
	zIndex: 0,
	borderRadius: 0,
	pointerEvents: 'none', // keep clicks for the UI above

	// same layering you had before (overlay + glow + base)
	background: [archOverlayGradient, baseGlass.background].join(', '),

	// blur needs a non-zero alpha base in Safari (our baseGlass.background already includes a color layer)
	backdropFilter: baseGlass.backdropFilter,
	WebkitBackdropFilter: baseGlass.WebkitBackdropFilter,
});

export const grain = style({
	...absolutePosition.fullSize(),
	inset: 0,
	borderRadius: 0,
	...noiseBg(),
});
