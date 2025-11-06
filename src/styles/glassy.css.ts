import { style } from '@vanilla-extract/css';
import { createGlassBackground, glassVars } from './helpers/glassy';
import { globalDropShadowFilter } from './helpers/shadow';
import { noiseBg } from './helpers/noiseSVG';

const glassBackground = createGlassBackground();
const innerRadius = glassVars.border.radius.subtract(
	glassVars.border.width,
);
// const innerMostRadius = `calc(${glassVars.border.width.css()} - ${glassVars.border.width.double.css()})`;

/**
 * Named layers for the default glass surface. Panels can reuse or
 * replace these strings to swap in alternative themes without
 * reverse-engineering gradients.
 */
export const surfaceLayers = glassBackground.backgroundLayers;
export const surfaceBaseColor = glassBackground.backgroundColor;

const glassSurface = style({
	position: 'relative',
	width: '100%',
	height: '100%',
	...glassBackground,
});

export const bg = glassSurface;
export const navSurface = glassSurface;

export const surface = style([
	glassSurface,
	{
		borderRadius: glassVars.border.radius.css(),
		position: 'relative',
	},
]);

export const surfaceFill = style({
	position: 'absolute',
	left: glassVars.border.width.css(),
	top: glassVars.border.width.css(),
	width: `calc(100% - ${glassVars.border.width.double().css()})`,
	height: `calc(100% - ${glassVars.border.width.double().css()})`,
	borderRadius: innerRadius.css(),
	background: glassBackground.background,
	pointerEvents: 'none',
	zIndex: 0,
});

export const surfaceShine = style({
	position: 'absolute',
	left: glassVars.border.width.css(),
	top: glassVars.border.width.css(),
	width: '100%',
	height: '100%',
	borderRadius: innerRadius.css(),
	background: `linear-gradient(135deg, ${glassVars.surfaceGlowPrimaryTint
		.alpha(glassVars.surfaceGlow.primaryTintAlpha)
		.css()}, ${glassVars.surfaceGlowSecondaryTint
		.alpha(glassVars.surfaceGlow.secondaryTintAlpha)
		.css()})`,
	mixBlendMode: 'screen',
	filter: `blur(${glassVars.surfaceGlow.blur.css()})`,
	opacity: glassVars.surfaceGlow.opacity,
	pointerEvents: 'none',
	zIndex: 2,
});

export const element = style({
	position: 'relative',
	width: '100%',
	height: '100%',
	borderRadius: glassVars.border.radius.css(),
	zIndex: 4,
});

export const grain = style({
	position: 'absolute',
	left: glassVars.border.width.css(),
	top: glassVars.border.width.css(),
	width: `calc(100% - ${glassVars.border.width.double().css()})`,
	height: `calc(100% - ${glassVars.border.width.double().css()})`,
	pointerEvents: 'none',
	borderRadius: innerRadius.css(),
	...noiseBg({ backgroundImage: glassVars.noiseDataUri() }),
	zIndex: 3,
});

export const stroke = style({
	transform: `translateY(${glassVars.border.width.multiply(-0.25).css()})`,
});

export const shadow = style({
	filter: globalDropShadowFilter(),
});

export const content = style({
	position: 'relative',
});
