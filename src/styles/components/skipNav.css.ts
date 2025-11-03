import { style } from '@vanilla-extract/css';
import { colorVars } from '../componentTokens/global.componentTokens';
import { m } from '../measurementKit';

export const link = style({
	position: 'fixed',
	left: '50%',
	transform: 'translate(-50%, -200%)',
	top: m(2).css(),
	backgroundColor: colorVars.bodyBg.css(),
	color: colorVars.bodyFg.css(),
	padding: `${m(2).css()} ${m(4).css()}`,
	borderRadius: m(2).css(),
	textDecoration: 'none',
	boxShadow: `0 ${m(1).css()} ${m(4).css()} rgba(0,0,0,0.25)`,
	zIndex: 200,
	transition: 'transform 180ms ease-in-out, opacity 180ms ease-in-out',
	opacity: 0,
	fontWeight: 600,
	selectors: {
		'&:focus, &:focus-visible': {
			transform: 'translate(-50%, 0)',
			opacity: 1,
		},
	},
});
