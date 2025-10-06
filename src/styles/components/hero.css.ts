import { style, globalStyle } from '@vanilla-extract/css';
// import { makeGradient } from '../helpers/gradients';
// import { menuVars } from '../vars';
import { paddings } from '../helpers/spacing';
import { fullSizeOfParent } from '../helpers/positioning';
// import type { Color } from 'chroma-js';
// import { absolutePosition } from '../helpers/positioning';

export const root = style({
	display: 'flex',
	alignItems: 'center',
	position: 'relative',
	// ...paddings({
	// top: Math.max(menuVars.height, heroVars.paddings.top),
	// bottom: chevronVars.container.height,
	// }),
	minHeight: '100vh',
	overflow: 'hidden',
});

export const image = style({
	...fullSizeOfParent(),
	zIndex: 0,
	pointerEvents: 'none',
});

globalStyle(`.${image} img`, {
	display: 'block',
	width: '100%',
	height: '100%',
	objectFit: 'cover',
});

export const video = style({
	...fullSizeOfParent(),
	zIndex: 0,
	inset: 0,
	pointerEvents: 'none',
	objectFit: 'cover',
	willChange: 'transform',
});

export const content = style({
	position: 'relative',
	zIndex: 2,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '20px',
});

export const heading = style({
	textShadow: '0 0 10px rgba(0,0,0,.72)',
	textAlign: 'center',
});
export const paragraph = style({
	textAlign: 'center',
});

export const panel = style({
	width: 'fit-content',
	maxWidth: 'min(90vw, 640px)',
	padding: '20px',
	gap: '20px',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	alignSelf: 'center',
	margin: '0 auto',
});
