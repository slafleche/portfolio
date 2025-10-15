import { style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient';
import { colorVars, gradients } from '../vars';
import border from '../helpers/borders';
import { m } from '../helpers/measurement';
import { paddings } from '../helpers/spacing';
import { absolutePosition } from '../helpers/positioning';
import { globalBoxShadow } from '../helpers/shadow';

export const root = style({
	border: 'solid black 10px',
	margin: '20px',
	// ...paddings({ all: m(10) }),
	// minHeight: '100px',
	// maxWidth: '50vw',
	// margin: 'auto',

	selectors: {
		'&[data-side="left"]': {
			gridColumn: '1',
		},
		'&[data-side="right"]': {
			gridColumn: '2',
		},
	},
});

export const container = style({
	display: 'grid',
	gridTemplateColumns: '1fr auto 1fr',
	gap: '24px',
	alignItems: 'stretch',
});

export const title = style({});

export const image = style({
	justifySelf: 'center',
	alignSelf: 'center',
	gridColumn: '2',
	position: 'relative',
	display: 'block',
	width: '200px',
	height: '200px',
	overflow: 'hidden',
	borderRadius: '50%',
	boxShadow: globalBoxShadow(),
	...border({
		color: colorVars.bodyFg.css(),
		width: m(6),
	}),
	...paddings({
		top: '100%',
	}),
	selectors: {
		'&:after': {
			content: '',
			...absolutePosition.fullSize(),
			borderRadius: '50%',
			boxShadow: globalBoxShadow({
				inset: true,
			}),
		},
	},
});

export const gradient = style({
	height: '100%',
});

export const cardGradientA = style(
	makeCardGradient(gradients[0], {
		// extrasPerSpan: 100,
		linearDirection: m(40, 'deg'),
	}),
);

export const cardGradientB = style(makeCardGradient(gradients[1]));
