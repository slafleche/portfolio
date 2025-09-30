import { style } from '@vanilla-extract/css';
import { makeGradient } from '../helpers/gradients';
import { gradientFull, menuVars } from '../vars';
import { paddings } from '../helpers/spacing';
import { fullSizeOfParent } from '../helpers/positioning';
import type { Color } from 'chroma-js';
// import { absolutePosition } from '../helpers/positioning';

const vertialPadding = 40;

export const root = style({
	display: 'block',
	position: 'relative',
	...paddings({
		vertical: menuVars.height.add(vertialPadding),
	}),
	marginBottom: '40px',
});

export const gradient = style({
	...fullSizeOfParent(),
	...makeGradient({
		spotA: gradientFull.overlayA,
		spotB: gradientFull.overlayB,
		linearColors: gradientFull.linear as [Color, Color, Color],
	}),
	opacity: 0.5,
});

export const heading = style({});
export const paragraph = style({});
