import './utilities.css';

import { globalStyle } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';

import { documentSurface } from '../modules/globals/document.module';
import { typographyFontVariants } from '../tokens/fontVariants/typography';
import { themeColours } from '../tokens/global.tokens';
import { anchorMenuVars } from '../tokens/menu.tokens';
import { textStyleVars } from '../tokens/textStyles.tokens';
import {
  ReducedMotion,
  reducedMotion,
} from './helpers/accessibility.helper';
import borders from './helpers/borders.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from './helpers/gradients.helper';
import { outlines } from './helpers/outlines.helper';
import { margins, paddings } from './helpers/spacing.helper';
import { fontStylesFromFontVariant } from './helpers/typography.helper';



const {
  palette: {
    body: { background: bodyBg, foreground: bodyFg },
  },
} = documentSurface;

const bodyFontStyles = fontStylesFromFontVariant({
  variant: typographyFontVariants.body,
});

const bgGradient = buildLinear({
  angle: m(100, 'deg'),
  stops: [
    {
      at: mPercent(0),
      color: bodyBg,
    },
    {
      at: mPercent(100),
      color: themeColours.purples.reddish.mix(
        themeColours.purples.dark,
        0.3,
      ),
    },
  ],
});

globalStyle('body', {
  minHeight: [
    '100vh',
    '100dvh',
  ],
  margin: 0,
  padding: 0,
  backgroundColor: bodyBg.css(),
  ...gradientAsBgImg(bgGradient),
});

globalStyle('html', {
  WebkitTextSizeAdjust: '100%',
  scrollbarGutter: 'stable',
});

globalStyle('html, body', {
  margin: 0,
  padding: 0,
  color: bodyFg.css(),
  ...bodyFontStyles,
  fontOpticalSizing: 'auto',
  fontStyle: 'normal',
  overscrollBehavior: 'none',
  scrollBehavior: 'auto',
  lineHeight: 1.8,
  ...reducedMotion(ReducedMotion.on, {
    scrollBehavior: 'auto',
  }),
});

globalStyle('html[data-smooth-scroll="true"]', {
  scrollBehavior: 'smooth',
  ...reducedMotion(ReducedMotion.on, {
    scrollBehavior: 'auto',
  }),
});

globalStyle('html[data-smooth-scroll="true"] body', {
  scrollBehavior: 'smooth',
  ...reducedMotion(ReducedMotion.on, {
    scrollBehavior: 'auto',
  }),
});

globalStyle('main', {
  display: 'block',
  minHeight: [
    '100vh',
    '100dvh',
  ],
});

globalStyle('abbr[title]', {
  ...borders.none(),
  textDecoration: 'underline',
  textDecorationStyle: 'dotted',
});

globalStyle('small', {
  fontSize: '80%',
});

globalStyle('sub', {
  fontSize: '75%',
  lineHeight: 0,
  position: 'relative',
  verticalAlign: 'baseline',
  bottom: '-0.25em',
});

globalStyle('sup', {
  fontSize: '75%',
  lineHeight: 0,
  position: 'relative',
  verticalAlign: 'baseline',
  top: '-0.5em',
});

globalStyle('img', {
  borderStyle: 'none',
});

globalStyle('svg', {
  display: 'block',
});

globalStyle('button, input, optgroup, select, textarea', {
  fontFamily: 'inherit',
  fontSize: '100%',
  lineHeight: 1.3,
  margin: 0,
  padding: 0,
  ...borders.radii(m(0), {
    output: true,
  }),
  border: 'none',
  WebkitAppearance: 'none',
  appearance: 'none',
});

globalStyle('button, input', {
  overflow: 'visible',
});

globalStyle('button, select', {
  textTransform: 'none',
});

globalStyle(
  'button, [type="button"], [type="reset"], [type="submit"]',
  {
    WebkitAppearance: 'none',
    appearance: 'none',
  },
);

globalStyle(
  'button:focus-visible, [type="button"]:focus-visible, [type="reset"]:focus-visible, [type="submit"]:focus-visible',
  {
    ...outlines(),
  },
);

globalStyle(
  'button:not(:disabled), [type="button"]:not(:disabled), [type="reset"]:not(:disabled), [type="submit"]:not(:disabled)',
  {
    cursor: 'pointer',
  },
);

globalStyle(
  'button:disabled, [type="button"]:disabled, [type="reset"]:disabled, [type="submit"]:disabled',
  {
    cursor: 'not-allowed',
  },
);

globalStyle(
  'button::-moz-focus-inner, [type="button"]::-moz-focus-inner, [type="reset"]::-moz-focus-inner, [type="submit"]::-moz-focus-inner',
  {
    borderStyle: 'none',
    padding: 0,
  },
);

globalStyle(
  'button:-moz-focusring, [type="button"]:-moz-focusring, [type="reset"]:-moz-focusring, [type="submit"]:-moz-focusring',
  {
    ...outlines(),
  },
);

globalStyle('fieldset', {
  ...paddings({
    top: m(0.35, 'em'),
    horizontal: m(0.75, 'em'),
    bottom: m(0.625, 'em'),
  }),
});

globalStyle('legend', {
  boxSizing: 'border-box',
  color: 'inherit',
  display: 'table',
  maxWidth: '100%',
  padding: 0,
  whiteSpace: 'normal',
});

globalStyle('progress', {
  verticalAlign: 'baseline',
});

globalStyle('textarea', {
  overflow: 'auto',
  ...borders.radii(m(0)),
});

globalStyle('[type="checkbox"], [type="radio"]', {
  boxSizing: 'border-box',
  padding: 0,
});

globalStyle('[type="search"]::-webkit-search-decoration', {
  WebkitAppearance: 'none',
  appearance: 'none',
});

globalStyle('details', {
  display: 'block',
});

globalStyle('summary', {
  display: 'list-item',
});

globalStyle('template', {
  display: 'none',
});

globalStyle('[hidden]', {
  display: 'none',
});

globalStyle(
  'ul[data-ui="list-unordered"], ol[data-ui="list-ordered"]',
  {
    margin: 0,
    padding: 0,
  },
);

globalStyle(
  'ul:not([data-ui="list-unordered"]), ol:not([data-ui="list-ordered"])',
  {
    paddingInlineStart: 0,
    marginBlockStart: 0,
    marginBlockEnd: 0,
  },
);

globalStyle('h1, h2, h3, h4, h5, h6', {
  all: 'unset',
  display: 'block',
  padding: 0,
  border: 0,
  position: 'relative',
});

// Heading Level Styles
for (let level = 1; level <= 6; level++) {
  const variant =
    typographyFontVariants[
      `h${level}` as keyof typeof typographyFontVariants
    ];
  globalStyle(`h${level}:not([data-ui="heading"])`, {
    ...fontStylesFromFontVariant({
      variant,
      baseVariant: typographyFontVariants.heading,
      includeFontMargins: true,
    }),
  });
  globalStyle(
    `h${level}:not([data-ui="heading"])[data-first="true"]`,
    {
      ...paddings({ top: 0 }),
    },
  );
}

globalStyle("*, *:after, *:before, input[type='search']", {
  boxSizing: 'border-box',
});

globalStyle('ul[data-ui="list-unordered"]', {
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

globalStyle('ol[data-ui="list-ordered"]', {
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

globalStyle('li[data-ui="list-item"]', {
  margin: 0,
  padding: 0,
});

globalStyle('a[data-ui="link"]', {
  color: 'inherit',
  textDecoration: 'none',
});

globalStyle('a[data-ui="link"]:focus-visible', {
  ...outlines(),
});

globalStyle('hr', {
  width: `calc(100% - ${anchorMenuVars.handle.sizeWithBorder.multiply(2).css()})`,
  maxWidth: '600px',
  opacity: 0.5,
  height: 0,
  ...borders(textStyleVars.horizontalRule.borders),
  ...margins(textStyleVars.horizontalRule.margins),
});

globalStyle('pre', {
  display: 'block',
  marginBlock: 0,
  marginInline: 0,
  whiteSpace: 'pre',
  lineHeight: 1.5,
});
