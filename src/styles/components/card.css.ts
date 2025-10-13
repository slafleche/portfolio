import { style } from '@vanilla-extract/css';
import { makeGradient } from '../helpers/gradients';
import { colorVars, gradientA, gradientB } from '../vars';
import border from '../helpers/borders';
import { m } from '../helpers/measurement';
import { paddings } from '../helpers/spacing';
import { absolutePosition } from '../helpers/positioning';
import { globalBoxShadow } from '../helpers/shadow';

export const container = style({
	display: 'grid',
	gridTemplateColumns: '1fr auto 1fr',
	gap: '24px',
	alignItems: 'stretch',
});

export const card = style({
	border: 'solid black 10px',
	// ...paddings({ all: m(10) }),
	// minHeight: '100px',
	// maxWidth: '50vw',
	// margin: 'auto',

	selectors: {
		'&[data-side="left"]': { gridColumn: '1' },
		'&[data-side="right"]': { gridColumn: '2' },
	},
});

export const title = style({});

export const image = style({
	justifySelf: 'center',
	alignSelf: 'center',
	gridColumn: '2',
	position: 'relative',
	display: 'block',
	maxWidth: '100%',
	height: 'auto',
	width: '200px',
	overflow: 'hidden',
	borderRadius: '50%',
	boxShadow: globalBoxShadow(),
	...border({
		color: colorVars.bodyFg.css(),
		width: m(6),
	}),
	selectors: {
		'&:after': {
			content: '',
			...absolutePosition.fullSize(),
			borderRadius: '50%',
			boxShadow: globalBoxShadow({ inset: true }),
		},
	},
});

export const cardGradientA = style(
	makeGradient({
		spotA: gradientA.overlayA,
		spotB: gradientA.overlayB,
		linearColors: gradientA.linear as [Color, Color, Color],
	}),
);

export const cardGradientB = style(
	makeGradient({
		spotA: gradientB.overlayA,
		spotB: gradientB.overlayB,
		linearColors: gradientB.linear as [Color, Color, Color],
	}),
);
