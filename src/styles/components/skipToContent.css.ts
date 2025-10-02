import { style } from '@vanilla-extract/css';

export const root = style({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	position: 'absolute',
	bottom: 0,
	left: 0,
	right: 0,
	height: '200px',
});

export const link = style({
	opacity: 0.8,
	transition: 'opacity 0.3s ease-out',
	selectors: {
		'&:hover, &:focus': {
			opacity: 1,
		},
	},
});
