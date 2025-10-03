import { style } from '@vanilla-extract/css';
import { createGlassBackground, glassVars } from './helpers/glassy';
import { globalBoxShadow, globalDropShadowFilter } from './helpers/shadow';
import { noiseBg } from './helpers/noiseSVG';

const glassBackground = createGlassBackground();
const defaultRadius = glassVars.frameRadius.css();
const borderWidth = glassVars.width.css();
const doubleBorderWidth = glassVars.width.multiply(2).css();
const innerRadius = `calc(${defaultRadius} - ${borderWidth})`;
const innerMostRadius = `calc(${defaultRadius} - ${doubleBorderWidth})`;

const glassSurface = style({
	position: 'relative',
	width: '100%',
	height: '100%',
	...glassBackground,
});

export const bg = glassSurface;
export const navSurface = glassSurface;

export const frame = style({
	position: 'relative',
	borderRadius: defaultRadius,
	overflow: 'hidden',
	boxShadow: globalBoxShadow(),
});

export const surface = style([
	glassSurface,
	{
		borderRadius: defaultRadius,
		overflow: 'hidden',
		background: 'transparent',
		position: 'relative',
	},
]);

export const surfaceFill = style({
	position: 'absolute',
	left: borderWidth,
	top: borderWidth,
	width: `calc(100% - ${doubleBorderWidth})`,
	height: `calc(100% - ${doubleBorderWidth})`,
	borderRadius: innerRadius,
	background: glassBackground.background,
	pointerEvents: 'none',
	zIndex: 0,
});

export const surfaceShine = style({
	position: 'absolute',
	left: borderWidth,
	top: borderWidth,
	width: `calc(100% - ${doubleBorderWidth})`,
	height: `calc(100% - ${doubleBorderWidth})`,
	borderRadius: innerRadius,
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

export const surfaceBorder = style({
	position: 'absolute',
	top: 0,
	left: 0,
	// left: borderWidth,
	// top: borderWidth,
	width: '100%',
	height: '100%',
	// width: `calc(100% - ${doubleBorderWidth})`,
	// height: `calc(100% - ${doubleBorderWidth})`,
	// borderRadius: innerRadius,
	borderRadius: defaultRadius,
	padding: borderWidth,
	pointerEvents: 'none',
	WebkitMask:
		'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
	mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
	WebkitMaskComposite: 'xor',
	maskComposite: 'exclude',
	background: [
		`radial-gradient(circle at 0 0, ${glassVars.innerBorderColor
			.alpha(glassVars.innerBorderHighlight.radialStrength)
			.css()} 0, ${glassVars.innerBorderColor.alpha(0).css()} ${glassVars.outerBorderHighlight.spread.css()})`,
		`conic-gradient(from -90deg at 0 0, transparent 0deg, ${glassVars.innerBorderColor
			.alpha(glassVars.innerBorderHighlight.wedgeStrength)
			.css()} 0deg, ${glassVars.innerBorderColor
			.alpha(glassVars.innerBorderHighlight.wedgeStrength)
			.css()} ${glassVars.outerBorderHighlight.angle.css()}, transparent ${glassVars.outerBorderHighlight.angle.css()})`,
	].join(', '),
	mixBlendMode: 'screen',
	opacity: glassVars.innerBorderHighlight.opacity,
	zIndex: 1,
});

export const rim = style({
	position: 'absolute',
	inset: 0,
	padding: glassVars.outerBorderHighlight.width.css(),
	borderRadius: defaultRadius,
	pointerEvents: 'none',
	WebkitMask:
		'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
	mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
	WebkitMaskComposite: 'xor',
	maskComposite: 'exclude',
	background: `radial-gradient(circle at 0 0, ${glassVars.innerBorderColor
		.alpha(glassVars.outerBorderHighlight.strength * 0.22)
		.css()} 0, ${glassVars.innerBorderColor.alpha(0).css()} ${glassVars.outerBorderHighlight.spread.css()}),
   conic-gradient(from -90deg at 0 0, transparent 0deg, ${glassVars.innerBorderColor
			.alpha(glassVars.outerBorderHighlight.strength * 0.8)
			.css()} 0deg, ${glassVars.innerBorderColor
			.alpha(glassVars.outerBorderHighlight.strength * 0.6)
			.css()} ${glassVars.outerBorderHighlight.angle.css()}, transparent ${glassVars.outerBorderHighlight.angle.css()})`,
	mixBlendMode: 'screen',
	filter: 'blur(0.35px)',
	opacity: glassVars.outerBorderHighlight.strength + 0.12,
	zIndex: 5,
});

export const element = style({
	position: 'relative',
	width: '100%',
	height: '100%',
	borderRadius: defaultRadius,
	zIndex: 4,
});

export const grain = style({
	position: 'absolute',
	left: borderWidth,
	top: borderWidth,
	width: `calc(100% - ${doubleBorderWidth})`,
	height: `calc(100% - ${doubleBorderWidth})`,
	pointerEvents: 'none',
	borderRadius: innerMostRadius,
	backgroundImage: glassVars.noiseDataUri(),
	...noiseBg(),
	zIndex: 3,
});

export const stroke = style({
	transform: `translateY(${glassVars.width.multiply(-0.25).css()})`,
});

export const shadow = style({
	filter: globalDropShadowFilter(),
});
