import { globalStyle, style } from '@vanilla-extract/css';
import { composeFontStyles } from '../helpers/typography';
import { fontVars } from '../vars';

/**
 * For user content, we wrap arbitrary HTML with this class and style
 * descendants via nested selectors.
 */
export const userContent = style({});

// child elements
globalStyle(`${userContent} h1`, {
	...composeFontStyles({ token: fontVars.h1 }),
	margin: 0,
});

globalStyle(`${userContent} h2`, {
	...composeFontStyles({ token: fontVars.h2 }),
	margin: 0,
});

globalStyle(`${userContent} h3`, {
	...composeFontStyles({ token: fontVars.h3 }),
	margin: 0,
});

globalStyle(`${userContent} h4`, {
	...composeFontStyles({ token: fontVars.h4 }),
	margin: 0,
});

globalStyle(`${userContent} h5`, {
	...composeFontStyles({ token: fontVars.h5 }),
	margin: 0,
});

globalStyle(`${userContent} h6`, {
	...composeFontStyles({ token: fontVars.h6 }),
	margin: 0,
});

globalStyle(`${userContent} p`, {
	...composeFontStyles({ token: fontVars.body }),
	margin: 0,
});
