import { globalStyle, style } from '@vanilla-extract/css';
import { composeFontStyles } from '../helpers/typography';
import { colorVars, fontVars } from '../vars';

/**
 * For user content, we wrap arbitrary HTML with this class and style
 * descendants via nested selectors.
 */
export const userContent = style({});

const headingSelectors = (tag: HeadingTag) =>
	[
		`.${userContent} ${tag}`,
		`[data-ui="content"] ${tag}`,
		`${tag}[data-ui="heading"]`,
	].join(', ');

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingTokenKey = Extract<HeadingTag, keyof typeof fontVars>;

const applyHeadingStyles = (tag: HeadingTag, tokenKey: HeadingTokenKey) => {
	globalStyle(headingSelectors(tag), {
		...composeFontStyles({ token: fontVars.heading }),
		...composeFontStyles({ token: fontVars[tokenKey] }),
		margin: 0,
		color: colorVars.bodyFg.css(),
	});
};

applyHeadingStyles('h1', 'h1');
applyHeadingStyles('h2', 'h2');
applyHeadingStyles('h3', 'h3');
applyHeadingStyles('h4', 'h4');
applyHeadingStyles('h5', 'h5');
applyHeadingStyles('h6', 'h6');

globalStyle(`.${userContent} p`, {
	...composeFontStyles({ token: fontVars.body }),
	margin: 0,
});
