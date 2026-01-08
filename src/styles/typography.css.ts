import { globalStyle, style } from '@vanilla-extract/css';

import { typographyFontVariants } from '../tokens/fontVariants/typography';
import { colorVars } from '../tokens/global.tokens';
import { textStyleVars } from '../tokens/textStyles.tokens';
import { backgrounds } from './helpers/background.helper';
import borders from './helpers/borders.helper';
import { color } from './helpers/colorWrap.helper';
import { fontStylesFromFontVariant } from './helpers/fontVariant.helper';
import { outlines } from './helpers/outlines.helper';
import { margins, paddings } from './helpers/spacing.helper';
import { globalMediaQueryStyle } from './responsive/mediaQueries';

export const userContent = style({});

// Generte styles for each heading level
for (let level = 1; level <= 6; level++) {
  const variant =
    typographyFontVariants[
      `h${level}` as keyof typeof typographyFontVariants
    ];
  globalStyle(`h${level}:not([data-ui="heading"])`, {
    display: 'block',
    color: colorVars.bodyFg.css(),
    ...fontStylesFromFontVariant({
      variant,
      baseVariant: typographyFontVariants.heading,
      includeFontMargins: true,
    }),

    ...globalMediaQueryStyle({
      compact: {
        textAlign: 'center',
      },
    }),
  });
}

globalStyle(`.${userContent} p:not([data-ui="paragraph"])`, {
  ...fontStylesFromFontVariant({
    variant: typographyFontVariants.body,
  }),
  ...margins(textStyleVars.paragraph.margins),
  color: colorVars.bodyFg.css(),
});

globalStyle(
  `.${userContent} [data-first], p:not([data-ui])[data-first]`,
  {
    marginTop: 0,
    paddingTop: 0,
  },
);

globalStyle(
  `.${userContent} [data-last], p:not([data-ui])[data-last]`,
  {
    marginBottom: 0,
    paddingBottom: 0,
  },
);

globalStyle('blockquote', {
  color: textStyleVars.blockquote.color.css(),
  ...margins(textStyleVars.blockquote.margins),
  ...paddings(textStyleVars.blockquote.paddings),
  ...borders(textStyleVars.blockquote.borders),
});

globalStyle(`.${userContent} ul:not([data-ui="list-unordered"])`, {
  ...margins(textStyleVars.list.unordered.margins),
  ...paddings(textStyleVars.list.unordered.paddings),
});

globalStyle(`.${userContent} ol:not([data-ui="list-ordered"])`, {
  ...margins(textStyleVars.list.ordered.margins),
  ...paddings(textStyleVars.list.ordered.paddings),
});

globalStyle(`.${userContent} li:not([data-ui="list-item"])`, {
  ...margins(textStyleVars.list.item.margins),
});

globalStyle(`code`, {
  fontFamily: textStyleVars.code.inline.fontFamily,
  ...borders(textStyleVars.code.inline.borders),
  ...paddings(textStyleVars.code.inline.paddings),
  ...backgrounds(textStyleVars.code.inline.backgrounds),
});

const codeBlock = textStyleVars.code.block;
globalStyle('pre', {
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: codeBlock.fontFamily,
  ...margins(codeBlock.margins),
  ...paddings(codeBlock.paddings),
  ...borders(codeBlock.borders),
  ...backgrounds(codeBlock.backgrounds),
});

globalStyle('pre code', {
  fontFamily: codeBlock.fontFamily,
  backgroundColor: color('transparent').css(),
  padding: 0,
});

const linkRules = textStyleVars.link;

globalStyle(`.${userContent} a:not([data-ui="link"])`, {
  color: linkRules.default.color.css(),
  textDecoration: 'none',
  // textUnderlineOffset: linkRules.default.underlineOffset.css(),
});

globalStyle(`.${userContent} a:not([data-ui="link"]):hover`, {
  textDecoration: 'underline',
  textDecorationThickness:
    linkRules.hover.textDecorationThickness.css(),
  color: linkRules.hover.color.css(),
});

globalStyle(`.${userContent} a:not([data-ui="link"]):focus-visible`, {
  ...outlines({
    color: linkRules.focusVisible.outlines.color,
    width: linkRules.focusVisible.outlines.width,
    offset: linkRules.focusVisible.outlines.offset,
  }),
});

globalStyle(`.${userContent} a:not([data-ui="link"]):active`, {
  color: linkRules.active.color.css(),
  textDecoration: 'underline',
});

globalStyle(`.${userContent} a:not([data-ui="link"]):visited`, {
  color: linkRules.visited.color.css(),
  textDecoration: 'underline',
});

globalStyle('em', {
  fontStyle: textStyleVars.em.fontStyle,
});

globalStyle('strong', {
  fontWeight: typographyFontVariants.body.weights.strong,
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
