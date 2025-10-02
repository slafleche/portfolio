import { style, globalStyle } from '@vanilla-extract/css';
import { makeGradient } from '../helpers/gradients';
import { chevronVars, gradientFull, menuVars } from '../vars';
import { paddings } from '../helpers/spacing';
import { fullSizeOfParent } from '../helpers/positioning';
import type { Color } from 'chroma-js';
// import { absolutePosition } from '../helpers/positioning';

const vertialPadding = 40;

export const root = style({
	display: 'flex',
	alignItems: 'center',
	position: 'relative',
	...paddings({
		vertical: menuVars.height.add(vertialPadding),
	}),
	marginBottom: '40px',
	minHeight: '100vh',
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

// export const gradient = style({
// 	...fullSizeOfParent(),
// 	...makeGradient({
// 		spotA: gradientFull.overlayA,
// 		spotB: gradientFull.overlayB,
// 		linearColors: gradientFull.linear as [Color, Color, Color],
// 	}),
// 	opacity: 0.8,
// 	zIndex: 1,
// 	pointerEvents: 'none',
// });

export const content = style({
	position: 'relative',
	zIndex: 2,
});

export const heading = style({
	textShadow: '0 0 10px rgba(0,0,0,.72)',
	textAlign: 'center',
});
export const paragraph = style({
	textAlign: 'center',
});

