import { style } from '@vanilla-extract/css';
import { createGlassBackground, glassVars } from './helpers/glassy';
import { globalBoxShadow, globalDropShadowFilter } from './helpers/shadow';
import { noiseBg } from './helpers/noiseSVG';
import { colorVars } from './vars';

const glassBackground = createGlassBackground();
const innerRadius = glassVars.border.radius.subtract(glassVars.border.width);
// const innerMostRadius = `calc(${glassVars.border.width.css()} - ${glassVars.border.width.double.css()})`;

const glassSurface = style({
	position: 'relative',
	width: '100%',
	height: '100%',
	...glassBackground,
});

export const bg = glassSurface;
export const navSurface = glassSurface;

export const frame = style({
	// position: 'relative',
	borderRadius: glassVars.border.radius.css(),
	// overflow: 'hidden',
	boxShadow: globalBoxShadow(),
});

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

export const surfaceBorder = style({
	position: 'absolute',
	top: 0,
	left: 0,
	height: '100%',
	width: '100%',
	padding: glassVars.border.width.css(),
	borderRadius: glassVars.border.radius.css(),
	pointerEvents: 'none',
	WebkitMask:
		'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
	mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
	WebkitMaskComposite: 'xor',
	maskComposite: 'exclude',
	background: [
		`radial-gradient(circle at 0 0, ${glassVars.innerBorderColor
			.alpha(glassVars.innerBorderHighlight.radialStrength)
			.css()} 0, ${colorVars.transparent.css()} ${glassVars.outerBorderHighlight.spread.css()})`,
		`conic-gradient(from -90deg at 0 0, transparent 0deg, ${glassVars.innerBorderColor.css()} 0deg, ${glassVars.innerBorderColor.css()} ${glassVars.outerBorderHighlight.angle.css()}, transparent ${glassVars.outerBorderHighlight.angle.css()})`,
	].join(', '),
	mixBlendMode: 'screen',
	opacity: glassVars.innerBorderHighlight.opacity,
	zIndex: 1,
});

export const rim = style({
	position: 'absolute',
	inset: 0,
	padding: glassVars.border.width.css(),
	borderRadius: glassVars.border.radius.css(),
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
	// borderRadius: innerMostRadius,
	backgroundImage: glassVars.noiseDataUri(),
	...noiseBg(),
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
