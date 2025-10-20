import { style } from '@vanilla-extract/css';
import { m } from '@/styles/helpers/measurement';
import { colorVars, themeColours } from '../vars';
import { paddings } from '../helpers/spacing';
import { globalBoxShadow } from '../helpers/shadow';
import { focusOutline } from '../helpers/focusOutline';

const offset = m(26);
const buttonSize = m(66);
const iconSize = m(36);
const iconOffsetX = iconSize.divide(10).round();
const iconOffsetY = iconSize.divide(10).round();

export const root = style({
	position: 'fixed',
	left: offset.css(),
	bottom: offset.css(),
	width: buttonSize.css(),
	height: buttonSize.css(),
	borderRadius: '50%',
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: colorVars.white.alpha(0.95).css(),
	color: colorVars.navBg.css(),
	textDecoration: 'none',
	boxShadow: globalBoxShadow(),
	opacity: 0,
	pointerEvents: 'none',
	transform: 'translateY(12px)',
	transition:
		'opacity 160ms ease, transform 160ms ease, box-shadow 160ms ease',
	zIndex: 30,
	overflow: 'hidden',
	selectors: {
		'&:hover, &:focus-visible': {
			boxShadow: globalBoxShadow({ blur: m(12) }),
		},
		'&:focus-visible': focusOutline({
			color: themeColours.lights.b.mix(themeColours.lights.d, 0.5).css(),
			width: m(3),
			offset: m(4),
		}),
	},
});

export const gradient = style({
	position: 'absolute',
	inset: 0,
	borderRadius: '50%',
	backgroundImage: `linear-gradient(135deg, ${themeColours.lights.b.css()} 0%, ${themeColours.lights.d.css()} 100%)`,
	opacity: 0,
	transition: 'opacity 200ms ease',
	zIndex: 0,
	pointerEvents: 'none',
});

export const visible = style({
	opacity: 1,
	pointerEvents: 'auto',
	transform: 'translateY(0)',
});

export const icon = style({
	position: 'relative',
	zIndex: 1,
	...paddings({
		top: iconOffsetY,
		right: iconOffsetX,
	}),
	width: iconSize.css(),
	height: iconSize.css(),

	transition: 'color 200ms ease',
});

export const iconVisible = style({
	selectors: {
		[`${root}:hover &`]: {
			color: colorVars.white.css(),
		},
		[`${root}:focus-visible &`]: {
			color: colorVars.white.css(),
		},
	},
});

export const gradientVisible = style({
	selectors: {
		[`${root}:hover &`]: {
			opacity: 1,
		},
		[`${root}:focus-visible &`]: {
			opacity: 1,
		},
	},
});
