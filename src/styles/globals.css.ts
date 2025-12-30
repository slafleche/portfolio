import { globalStyle } from '@vanilla-extract/css';
import { m } from 'css-calipers';
import { documentSurface } from '../modules/globals/document.module';
import {
  ReducedMotion,
  reducedMotion,
} from './helpers/accessibility.helper';
import { paddings } from './helpers/spacing.helper';
import borders from './helpers/borders.helper';
import './utilities.css';
import { fontStylesFromFontVariant } from './helpers/fontVariant.helper';
import { typographyFontVariants } from '../tokens/fontVariants/typography';

const {
  palette: {
    body: { background: bodyBg, foreground: bodyFg },
  },
  layout: { arch, scrollPaddingOffset },
} = documentSurface;

const bodyFontStyles = fontStylesFromFontVariant(typographyFontVariants.body);
const headingFontStyles = fontStylesFromFontVariant(
  typographyFontVariants.heading,
);

globalStyle('body', {
  minHeight: '100vh',
  margin: 0,
  padding: 0,
  backgroundColor: bodyBg.css(),
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
  scrollBehavior: 'smooth',
  lineHeight: 1.8,
  scrollPaddingTop: `calc(${arch.top.css()} + ${arch.curveHeight.css()} + ${scrollPaddingOffset.css()})`,
  ...reducedMotion(ReducedMotion.on, {
    scrollBehavior: 'auto',
  }),
});

globalStyle('main', {
  display: 'block',
  minHeight: '100vh',
  '@supports': {
    '(min-height: 100svh)': {
      minHeight: '100svh',
    },
  },
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

globalStyle('button, input, optgroup, select, textarea', {
  fontFamily: 'inherit',
  fontSize: '100%',
  lineHeight: 'inherit',
  margin: 0,
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
    WebkitAppearance: 'button',
  },
);

globalStyle('button:not(:disabled)', {
  cursor: 'pointer',
});

globalStyle('button:disabled', {
  cursor: 'not-allowed',
});

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
    outline: '1px dotted ButtonText',
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
});

globalStyle('[type="checkbox"], [type="radio"]', {
  boxSizing: 'border-box',
  padding: 0,
});

globalStyle(
  '[type="number"]::-webkit-inner-spin-button, [type="number"]::-webkit-outer-spin-button',
  {
    height: 'auto',
  },
);

globalStyle('[type="search"]', {
  WebkitAppearance: 'textfield',
  outlineOffset: '-2px',
});

globalStyle('[type="search"]::-webkit-search-decoration', {
  WebkitAppearance: 'none',
});

globalStyle('::-webkit-file-upload-button', {
  WebkitAppearance: 'button',
  font: 'inherit',
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

globalStyle('hr', {
  boxSizing: 'content-box',
  height: 0,
  overflow: 'visible',
});

globalStyle('pre', {
  fontFamily: 'monospace, monospace',
  fontSize: '1em',
});

globalStyle('code, kbd, samp', {
  fontFamily: 'monospace, monospace',
  fontSize: '1em',
});

globalStyle('ul, ol', {
  margin: 0,
  padding: 0,
});

globalStyle('h1, h2, h3, h4, h5, h6', {
  all: 'unset',
  margin: 0,
  display: 'block',
  padding: 0,
  border: 0,
  position: 'relative',
  ...headingFontStyles,
});

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
