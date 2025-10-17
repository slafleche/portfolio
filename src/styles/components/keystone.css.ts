import { style } from '@vanilla-extract/css';
import { layoutVars } from '../layoutVars.css';

export const root = style({
	position: 'relative',
	display: 'block',
	width: '100%',
	maxWidth: layoutVars.contentWidth,
});

export const svg = style({
	display: 'block',
	width: '100%',
	height: 'auto',
});

export const imageWrapper = style({
	position: 'relative',
	width: '100%',
	height: '100%',
});

export const image = style({
	display: 'block',
	width: '100%',
	height: '100%',
});
