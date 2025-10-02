import { style } from '@vanilla-extract/css';
import { glassVars, transparentBorder } from './helpers/glossy';
import { globalDropShadowFilter } from './helpers/shadow';
import * as CSS from 'csstype';
import { absolutePosition } from './helpers/positioning';

export const bg = style({
	position: 'relative',
	background: [
		// Subtle white overlay for extra depth (very light), wired to glassVars.overlay
		`linear-gradient(${glassVars.overlay.direction}, ${glassVars.overlay.color
			.alpha(glassVars.overlay.topAlpha)
			.css()}, ${glassVars.overlay.color.alpha(0).css()} ${glassVars.overlay.midStop}, ${glassVars.overlay.color
			.alpha(glassVars.overlay.bottomAlpha)
			.css()} 100%)`,
		`linear-gradient(135deg, ${glassVars.tint1.css()}, ${glassVars.tint2.css()})`,
		glassVars.bg.css(),
	].join(', '),
	backdropFilter: `blur(${glassVars.blur.css()})`,
	WebkitBackdropFilter:
		`blur(${glassVars.blur.css()})` as CSS.Property.BackdropFilter,
});

export const element = style({
	position: 'relative',
	width: '100%',
	height: '100%',
});

export const grain = style({
	...absolutePosition.fullSize(),
	inset: 0,
	pointerEvents: 'none',
	borderRadius: 'inherit',
	backgroundImage: glassVars.noiseDataUri, // uses your SVG noise
	backgroundRepeat: 'repeat',
	backgroundSize: '240px 240px',
	mixBlendMode: 'overlay',
	opacity: '0.03',
});

// Stroke on bottom
export const stroke = style({
	transform: `translateY(${transparentBorder.thickness.multiply(-0.25).css()})`,
});

// Shadow on the bottom
export const shadow = style({
	// Use a global drop-shadow() based on dropShadowVars so it’s configurable in vars.ts
	filter: globalDropShadowFilter(),
});
