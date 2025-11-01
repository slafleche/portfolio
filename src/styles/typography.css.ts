import { globalStyle, style } from '@vanilla-extract/css';
import { colorVars, fontVars } from './vars';
import { composeFontStyles } from './helpers/typography';

export const userContent = style({});

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const headingSelectors = (tag: HeadingTag) =>
  [
    `[data-ui="content"] ${tag}`,
    `.${userContent} ${tag}`,
    `${tag}[data-ui="heading"]`,
  ].join(', ');

const applyHeadingStyles = (tag: HeadingTag) => {
  globalStyle(headingSelectors(tag), {
    ...composeFontStyles({ token: fontVars.heading }),
    ...composeFontStyles({ token: fontVars[tag] }),
    margin: 0,
    color: colorVars.bodyFg.css(),
  });
};

applyHeadingStyles('h1');
applyHeadingStyles('h2');
applyHeadingStyles('h3');
applyHeadingStyles('h4');
applyHeadingStyles('h5');
applyHeadingStyles('h6');

const paragraphSelectors = [
  `[data-ui="content"] p`,
  `.${userContent} p`,
].join(', ');

globalStyle(paragraphSelectors, {
  ...composeFontStyles({ token: fontVars.body }),
  margin: 0,
  color: colorVars.bodyFg.css(),
});

globalStyle(`.${userContent} img`, {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
});

globalStyle('strong', {
  fontWeight: 'bolder',
});

globalStyle('code', {
  overflowX: 'auto',
});

globalStyle('blockquote', {
  overflowX: 'auto',
});

globalStyle('del', {
  textDecoration: 'line-through',
});

globalStyle('hr', {
  border: 'none',
  width: '100%',
});


