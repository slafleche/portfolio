import { style } from '@vanilla-extract/css';
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
	width: `calc(100% + ${dropShadowVars.offsetX.css()}})`,
	height: `calc(100% + ${dropShadowVars.offsetY.css()}})`,
	pointerEvents: 'none',
	filter: `blur(${dropShadowVars.blur.css()})`,
});

export const shadowPath = style({
	fill: dropShadowVars.color.css(),
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
