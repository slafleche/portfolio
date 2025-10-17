import { style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient';
import { colorVars, gradients } from '../vars';
import { m } from '../helpers/measurement';
import { paddings } from '../helpers/spacing';
import { absolutePosition } from '../helpers/positioning';
import { globalBoxShadow } from '../helpers/shadow';
import { glassVars } from '../helpers/glassy';

export const root = style({
	position: 'relative',
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

export const frame = style({
	position: 'relative',
	borderRadius: glassVars.border.radius.css(),
	overflow: 'hidden',
	backgroundColor: colorVars.transparent.css(),
});

export const content = style({
	position: 'relative',
	zIndex: 2,
	...paddings({
		all: m(4),
	}),
	borderRadius: glassVars.border.radius.css(),
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
	border: `${m(6).css()} solid ${colorVars.bodyFg.css()}`,
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
	...absolutePosition.fullSize(),
	filter: 'blur(2px)',
	pointerEvents: 'none',
	borderRadius: 'inherit',
	zIndex: 0,
});

export const cardGradientA = style(
	makeCardGradient(gradients[0], {
		// extrasPerSpan: 100,
		linearDirection: m(110, 'deg'),
		// includeLinear: false,
		// includeSpots: false,
	}),
);

export const cardGradientB = style(
	makeCardGradient(gradients[1], {
		linearDirection: m(95, 'deg'),
	}),
);
