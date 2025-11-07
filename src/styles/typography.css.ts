import { globalStyle, style } from '@vanilla-extract/css';
import { paddings, margins } from './helpers/spacing.helper';
import borders from './helpers/borders.helper';
import { focusOutline } from './helpers/outlines.helper';
import { colorVars } from './componentTokens/global.componentTokens';
import {
  composeFontVariantStyles,
  fontVariants,
} from '../tokens/fontVariants.tokens';
import { textStyleVars } from '../tokens/textStyles.tokens';

export const userContent = style({});

for (let level = 1; level <= 6; level++) {
  const variant =
    fontVariants[`h${level}` as keyof typeof fontVariants];
  globalStyle(
    `.${userContent} h${level}, h${level}[data-ui="heading"]`,
    {
      color: colorVars.bodyFg.css(),
      ...composeFontVariantStyles(variant),
      ...margins(textStyleVars.paragraph.margins),
    },
  );
}

globalStyle(`.${userContent} p, p[data-ui="paragraph"]`, {
  ...composeFontVariantStyles(fontVariants.body),
  ...margins(textStyleVars.paragraph.margins),
  color: colorVars.bodyFg.css(),
});

globalStyle('blockquote', {
  color: textStyleVars.blockquote.color.css(),
  ...margins(textStyleVars.blockquote.margins),
  ...paddings(textStyleVars.blockquote.paddings),
  ...borders(textStyleVars.blockquote.borders),
});

globalStyle(`.${userContent} ul, ul[data-ui="list-unordered"]`, {
  ...margins(textStyleVars.list.unordered.margins),
  ...paddings(textStyleVars.list.unordered.paddings),
});

globalStyle(`.${userContent} ol, ol[data-ui="list-ordered"]`, {
  ...margins(textStyleVars.list.ordered.margins),
  ...paddings(textStyleVars.list.ordered.paddings),
});

globalStyle(`.${userContent} li, li[data-ui="list-item"]`, {
  ...margins(textStyleVars.list.item.margins),
});

globalStyle(`code`, {
  fontFamily: textStyleVars.code.inline.fontFamily,
  backgroundColor: textStyleVars.code.inline.backgroundColor.css(),
  ...borders(textStyleVars.code.inline.borders),
  ...paddings(textStyleVars.code.inline.paddings),
});

const codeBlock = textStyleVars.code.block;
globalStyle('pre', {
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: codeBlock.fontFamily,
  backgroundColor: codeBlock.backgroundColor.css(),
  ...margins(codeBlock.margins),
  ...paddings(codeBlock.paddings),
  ...borders(codeBlock.borders),
});

globalStyle('pre code', {
  fontFamily: codeBlock.fontFamily,
  backgroundColor: 'transparent',
  padding: 0,
});

const linkRules = textStyleVars.link;

globalStyle(`.${userContent} a, a[data-ui="link"]`, {
  color: linkRules.default.color.css(),
  textDecoration: 'none',
  textUnderlineOffset: linkRules.default.underlineOffset.css(),
});

globalStyle(`.${userContent} a:hover, a[data-ui="link"]:hover`, {
  textDecoration: 'underline',
  textDecorationThickness:
    linkRules.hover.textDecorationThickness.css(),
  color: linkRules.hover.color.css(),
});

globalStyle(
  `.${userContent} a:focus-visible, a[data-ui="link"]:focus-visible`,
  {
    ...focusOutline({
      color: linkRules.focusVisible.outlines.color,
      width: linkRules.focusVisible.outlines.width,
      offset: linkRules.focusVisible.outlines.offset,
    }),
  },
);

globalStyle(`.${userContent} a:active, a[data-ui="link"]:active`, {
  color: linkRules.active.color.css(),
  textDecoration: 'underline',
});

globalStyle(`.${userContent} a:visited, a[data-ui="link"]:visited`, {
  color: linkRules.visited.color.css(),
  textDecoration: 'underline',
});

globalStyle('em', {
  fontStyle: textStyleVars.em.fontStyle,
});

globalStyle('strong', {
  fontWeight: fontVariants.body.weights.strong,
});

globalStyle('del', {
  textDecoration: textStyleVars.del.textDecoration,
});

globalStyle('img', {
  display: textStyleVars.image.display,
  maxWidth: '100%',
  height: 'auto',
  ...margins(textStyleVars.image.margins),
  ...borders(textStyleVars.image.borders),
});

globalStyle('hr', {
  border: 'none',
  width: '100%',
  ...borders(textStyleVars.horizontalRule.borders),
  ...margins(textStyleVars.horizontalRule.margins),
});
