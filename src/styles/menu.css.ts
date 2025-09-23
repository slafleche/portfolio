import { style } from '@vanilla-extract/css';
import { absolutePosition, flexPosition } from './helpers/positioning';
import {
	archVars,
	colorVars,
	dropShadowVars,
	fontVars,
	logoVars,
} from './vars';
import { globalBoxShadow } from './helpers/shadow';
import { m } from './helpers/measurement';
import border from './helpers/border';

export const menu = style({
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	zIndex: 100,
	transform: `translate3d(0, -${
		(archVars.top +
			archVars.curveHeight +
			dropShadowVars.offsetY.value +
			dropShadowVars.blur.value) *
		1.5
	}px, 0)`,
	transition: 'transform 0.8s cubic-bezier(0.69, 0.42, 0.01, 1) 0.3s',
	willChange: 'transform',
	backfaceVisibility: 'hidden',

	selectors: {
		'&[data-mounted="true"]': {
			transform: 'translate3d(0, 0, 0)',
		},
	},
});

export const nav = style({
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'nowrap',
	width: '100%',
	height: archVars.top,
	...absolutePosition.topLeft(),
});

// One side
export const list = style({
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'nowrap',
	flexGrow: '1',
	width: '50%',
	selectors: {
		'&[data-side="left"]': {
			justifyContent: 'flex-end',
			order: 0,
			paddingRight: '50px', // TODO set dynamically with width of logo
		},
		'&[data-side="right"]': {
			justifyContent: 'flex-start',
			order: 1,
			paddingLeft: '50px', // TODO set dynamically with width of logo
		},
	},
});

export const item = style({
	// flex: '0 0 auto',
	// whiteSpace: 'nowrap',
	// display: 'flex',
	// alignItems: 'center',
});

// Intentionally reorder so the logo is the first item visually but not in DOM
export const item_1 = style({
	// order: 0,
});
export const item_2 = style({
	// order: 0,
});

// Logo in the middle
export const logoItem = style({
	position: 'absolute',
	top: 0,
	left: '50%',
	transform: `translateX(-${logoVars.width.value / 2}${logoVars.width.unit})`,
	width: logoVars.width.css(),
	height: logoVars.width.css(),
	...flexPosition.center(),
});

export const item_3 = style({
	order: 2,
});

export const item_4 = style({
	order: 2,
});

export const headerNavItem = style({
	...absolutePosition.topRight(),
	order: 5,
});

export const logoLink = style({
	...flexPosition.center(),
	width: logoVars.width.css(),
	height: logoVars.width.css(),
	transform: `translate(${logoVars.offsetX.css()}, ${logoVars.offsetY.css()})`,
});

export const link = style({
	textDecoration: 'none',
	fontWeight: 600,
	borderRadius: 8,
	padding: '0.25rem 0.5rem',
	selectors: {
		'&:hover': { textDecoration: 'underline' },
		'&[data-active="true"]': { background: 'rgba(0,0,0,0.06)' }, // state via data-attr
		'&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 },
	},
});

export const logo = style({
	width: logoVars.width.css(),
	height: 'auto',
	// filter: 'drop-shadow( 0px 10px 2px rgba(0, 0, 0, .7))',
});

export const localeChanger = style({
	...absolutePosition.topRight(),
});

const navLinkColor = colorVars.navFg.alpha(0.8).css();

export const navLink = style({
	position: 'relative',
	display: 'block',
	padding: `${m(2).css()} ${m(16).css()}`,
	// fontSize: fontVars.menu.size.css(),
	fontSize: '16px',
	textDecoration: 'none',
	letterSpacing: '0.5px',
	borderRadius: '20%',
	color: navLinkColor,
	// backgroundColor: colorVars.navFg.alpha(0.045).css(),
	// backdropFilter: `blur(10px)`,
	// ...border({
	// 	width: m(1),
	// 	color: colorVars.navFg.alpha(0.1).css(),
	// }),
	textShadow: `0px -0.5px 0px ${colorVars.white.alpha(0.4).css()},
	0px 1.2px 1.2px ${colorVars.black.alpha(0.45).css()}`,
	// backgroundClip: 'text',
	// WebkitBackgroundClip: 'text',
	// WebkitTextFillColor: 'transparent',

	// filter:	'drop-shadow(0 1px 0 rgba(255,255,255,0.15)) drop-shadow(0 1px 2px rgba(0,0,0,0.35))',
	// transition: 'transform 0.25s ease, filter 0.25s ease, text-shadow 0.25s ease',

	selectors: {
		'&:visited': {
			// color: navLinkColor,
			// color: colorVars.transparent.css(),
		},
		'&:hover, &:focus-visible': {
			// color: navLinkColor,
			// color: colorVars.transparent.css(),
			// transform: 'translateY(-1px)',
			// textShadow:
			// 	'0 -1px 0 rgba(255,255,255,0.55), 0 2px 2px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.45), 0 10px 20px rgba(0,0,0,0.5)',
			// filter:
			// 	'drop-shadow(0 2px 0 rgba(255,255,255,0.2)) drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
		},
		'&:focus-visible': {
			// color: navLinkColor,
			// outline: '2px solid currentColor', outlineOffset: 2
			// color: colorVars.transparent.css(),
		},
	},
});
