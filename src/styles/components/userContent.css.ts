import { globalStyle, style } from '@vanilla-extract/css';
import { m } from '../helpers/measurement';

/**
 * For user content, we wrap arbitrary
 * HTML with this class and style
 * descendants via nested selectors.
 */
export const userContent = style({});

// child elements
globalStyle(`${userContent} h1`, {
	fontSize: m(30).css(),
});

globalStyle(`${userContent} h2`, {});

globalStyle(`${userContent} p`, {});
