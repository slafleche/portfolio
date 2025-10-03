import { style } from '@vanilla-extract/css';
import { absolutePosition } from '../helpers/positioning';
import { colorVars, dropShadowVars } from '../vars';
import { createGlassBackground, glassVars } from '../helpers/glassy';

export const root = style({
	position: 'relative',
	overflow: 'visible',
	display: 'block',
});

export const svg = style({
	overflow: 'visible',
});

export const shadow = style({
	...absolutePosition.topLeft(),
	// Give extra room so the blurred, offset shadow doesn’t clip
	width: `calc(100% + ${dropShadowVars.offsetX.add(dropShadowVars.blur.multiply(2).value).css()})`,
	height: `calc(100% + ${dropShadowVars.offsetY.add(dropShadowVars.blur.multiply(2).value).css()})`,
	pointerEvents: 'none',
	filter: `blur(${dropShadowVars.blur.css()})`,
});

export const shadowPath = style({
	fill: dropShadowVars.color.css(),
});

const baseGlass = createGlassBackground();
const archOverlayGradient = `linear-gradient(180deg,
	${colorVars.white.alpha(0.14).css()} 0%,
	${colorVars.white.alpha(0.05).css()} 28%,
	${colorVars.black.alpha(0.06).css()} 82%,
	${colorVars.black.alpha(0.12).css()} 100%)`;

export const surface = style({
	position: 'relative',
	width: '100%',
	height: '100%',
	borderRadius: 0,
	background: [archOverlayGradient, baseGlass.background].join(', '),
	backdropFilter: baseGlass.backdropFilter,
	WebkitBackdropFilter: baseGlass.WebkitBackdropFilter,
});

export const grain = style({
	...absolutePosition.fullSize(),
	inset: 0,
	borderRadius: 0,
	pointerEvents: 'none',
	backgroundImage: glassVars.noiseDataUri,
	backgroundRepeat: 'repeat',
	backgroundSize: '240px 240px',
	mixBlendMode: 'overlay',
	opacity: '0.03',
});
