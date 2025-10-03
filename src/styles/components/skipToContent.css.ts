import { style } from '@vanilla-extract/css';
import { chevronVars, colorVars } from '../vars';
// import borders from '../helpers/borders';
import { globalBoxShadow } from '../helpers/shadow';

export const root = style({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'flex-start',
	position: 'absolute',
	bottom: 0,
	left: 0,
	right: 0,
	height: chevronVars.container.height.css(),
});

export const link = style({
	background: colorVars.bodyBg.alpha(0.5).css(),
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: '50%',
	width: chevronVars.width.add(chevronVars.padding.double().value).css(),
	height: chevronVars.width.add(chevronVars.padding.double().value).css(),
	transition: 'background 0.3s ease-in',
	boxShadow: globalBoxShadow(),
	selectors: {
		'&:hover': {
			opacity: 1,
			// background: colorVars.bodyBg.css(),
		},
	},
});
