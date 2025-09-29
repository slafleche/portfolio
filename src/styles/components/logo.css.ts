import { style } from '@vanilla-extract/css';
import { logoVars } from '../vars';
import { absolutePosition } from '../helpers/positioning';

export const logo = style({
	position: 'relative',
});

export const svg = style({
	width: logoVars.width.css(),
	height: 'auto',
});

export const shadow = style({
	...absolutePosition.topLeft(),
	width: logoVars.width.multiply(logoVars.shadowRatio).css(),
	height: 'auto',
});
