import { globalStyle } from '@vanilla-extract/css';
import { archVars, colorVars, fontVars, spacingVars } from './vars';
import {
  ReducedMotion,
  reducedMotion,
} from './helpers/accessibility';
import { composeFontStyles } from './helpers/typography';
import './utilities.css';

globalStyle('body', {
  minHeight: '100vh',
  margin: 0,
  padding: 0,
  backgroundColor: colorVars.bodyBg.css(),

  // ...backgroundHelper({
  //   repeat: 'repeat',
  //   color: colorVars.bodyBg.css(),
  //   // image: 'data:image/svg+xml;base64,...',
  // }),
});

globalStyle('html, body', {
  margin: 0,
  padding: 0,
  color: fontVars.body.color.css(),

  fontSize: fontVars.body.size.css(),

  ...composeFontStyles({ token: fontVars.body }),

  fontOpticalSizing: 'auto',
  fontStyle: 'normal',
  overscrollBehavior: 'none',
  scrollBehavior: 'smooth',
  lineHeight: 1.8,
  scrollPaddingTop: `calc(${archVars.top.css()} + ${archVars.curveHeight.css()} + ${spacingVars.scrollPaddingOffset.css()})`,
  ...reducedMotion(ReducedMotion.on, {
    scrollBehavior: 'auto',
  }),
});

globalStyle('h1, h2, h3, h4, h5, h6', {
  all: 'unset',
  margin: 0,
  marginBlockStart: '0',
  marginBlockEnd: '0',
  marginInlineStart: '0',
  marginInlineEnd: '0',
  display: 'block',
  padding: 0,
  border: 0,
  position: 'relative',
  ...composeFontStyles({ token: fontVars.heading }),
});

globalStyle("*, *:after, *:before, input[type='search']", {
  boxSizing: 'border-box',
});
