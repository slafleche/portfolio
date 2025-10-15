import { globalStyle } from '@vanilla-extract/css';
import { archVars, colorVars, fontVars, spacingVars } from './vars';
import {
	ReducedMotion,
	reducedMotion,
} from './helpers/accessibility';
import { fontWeightStyle } from './helpers/typography';

globalStyle('body', {
	minHeight: '100vh',
	margin: 0,
	padding: 0,
	backgroundColor: colorVars.bodyBg.css(),

	// ...backgroundHelper({
	//   repeat: 'repeat',
	//   color: colorVars.bodyBg.css(),
	//   // image: 'data:image/svg+xml;base64,...',
	// }),
});

globalStyle('html, body', {
	margin: 0,
	padding: 0,
	color: fontVars.body.color.css(),
	fontFamily: fontVars.body.family,
	fontSize: fontVars.body.size.css(),
	...fontWeightStyle(fontVars.menu, 80),
	fontOpticalSizing: 'auto',
	fontStyle: 'normal',
	overscrollBehavior: 'none',
	scrollBehavior: 'smooth',
	lineHeight: 1.8,
	scrollPaddingTop: `calc(${archVars.top.css()} + ${archVars.curveHeight.css()} + ${spacingVars.scrollPaddingOffset.css()})`,
	...reducedMotion(ReducedMotion.on, {
		scrollBehavior: 'auto',
	}),
});

globalStyle('h1, h2, h3, h4, h5, h6', {
	all: 'unset',
	margin: 0,
	marginBlockStart: '0',
	marginBlockEnd: '0',
	marginInlineStart: '0',
	marginInlineEnd: '0',
	display: 'block',
	padding: 0,
	border: 0,
	position: 'relative',
	fontFamily: fontVars.heading.family,
	lineHeight: '1.4',
});

globalStyle("*, *:after, *:before, input[type='search']", {
	boxSizing: 'border-box',
});

globalStyle('h1', {
	fontSize: '60px',
});

globalStyle('h2:not([data-reach-accordion-item])', {
	// background styles intentionally commented out
});

globalStyle('strong', {
	fontWeight: 'bolder',
});

// export const fullRotationAnimation = keyframes({
//   '0%': { transform: 'rotate(-360deg)' },
// });

// export const upAndDownAnimation = keyframes({
//   '0%': { transform: 'translateY(0)' },
//   '25%': { transform: 'translateY(2px)' },
//   '75%': { tra
