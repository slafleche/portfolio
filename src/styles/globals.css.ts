import { globalStyle } from '@vanilla-extract/css';
import { documentSurface } from '../modules/globals/document.module';
import { fontVars } from '../tokens/fontVars.tokens';
import {
  ReducedMotion,
  reducedMotion,
} from './helpers/accessibility';
import { composeFontStyles } from './helpers/typography.helpers';
import './utilities.css';

const {
  palette: {
    body: { background: bodyBg, foreground: bodyFg },
  },
  layout: { arch, scrollPaddingOffset },
} = documentSurface;

globalStyle('body', {
  minHeight: '100vh',
  margin: 0,
  padding: 0,
  backgroundColor: bodyBg.css(),
});

globalStyle('html, body', {
  margin: 0,
  padding: 0,
  color: bodyFg.css(),
  fontSize: fontVars.body.size.css(),
  ...composeFontStyles({ token: fontVars.body }),
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

globalStyle('h1, h2, h3, h4, h5, h6', {
  all: 'unset',
  margin: 0,
  display: 'block',
  padding: 0,
  border: 0,
  position: 'relative',
  ...composeFontStyles({ token: fontVars.heading }),
});

globalStyle("*, *:after, *:before, input[type='search']", {
  boxSizing: 'border-box',
});
