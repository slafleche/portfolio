import { style } from '@vanilla-extract/css';
// import { colorVars } from '../vars';
import { absolutePosition } from '../helpers/positioning';
import { dropShadowVars } from '../vars';

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
