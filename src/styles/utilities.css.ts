import { style } from '@vanilla-extract/css';
import * as CSS from 'csstype';
import nest from '@/styles/helpers/nesting';
// import { flexPosition } from './helpers/positioning';

// Many tokens in .ts are objects (e.g., chroma colors, measurement objects)
// that expose a `.css()` method to produce a CSS string on demand.
export type CssLike = { css: () => string };

// Utility classes
export const utilityStyles = style({
	selectors: {
		// Hide and element
		'&[data-visibility="hidden"]': {
			visibility: 'hidden !important' as CSS.Property.Visibility,
		},
		// Hide elements from user, but keep in DOM
		'&[data-visually="src-only"]': {
			position: 'absolute',
			width: '1px',
			height: '1px',
			padding: '0',
			margin: '-1px',
			overflow: 'hidden',
			clip: 'rect(0,0,0,0)',
			border: '0',
		},
		// Disable user interaction
		'&[data-interaction="none"]': {
			userSelect: 'none',
			pointerEvents: 'none',
		},
		// Accessibility, focus on visible only
		'&[data-focus-visibility="focus"]': {
			position: 'absolute',
			clip: 'rect(0 0 0 0)',
			height: '1px',
			width: '1px',
			margin: '-1px',
			overflow: 'hidden',
			padding: 0,
		},
		...nest('&[data-focus-visibility="focus"]', [
			{
				'&:focus, &.focus-visible': {
					zIndex: 1,
					width: 'auto',
					height: 'auto',
					clip: 'auto',
				},
			},
		]),

		// Set UI specific links with this reset to leave "user" content, e.g. markdown natural with the defaults
		'&[data-ui="link"]': {
			textDecoration: 'none',
			color: 'inherit',
		},
		...nest('&[data-ui="link"]', [
			{
				'&:visited': {
					color: 'inherit',
				},
			},
		]),
	},
});

export default utilityStyles;
