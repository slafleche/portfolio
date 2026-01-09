import { style } from '@vanilla-extract/css';

import { heroFontVariants } from '../../../tokens/fontVariants/hero';
import { colorVars } from '../../../tokens/global.tokens';
import { fontStylesFromFontVariant } from '../../helpers/fontVariant.helper';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
});

export const viewPort = style({
  display: 'inline-flex',
  backgroundColor: colorVars.black.css(),
  marginBottom: '20px',
  boxSizing: 'border-box',
  background: 'orange',
  padding: '1px 0',
});

export const heading = style({
  position: 'relative',
  textAlign: 'center',
  ...fontStylesFromFontVariant({
    variant: heroFontVariants.hero,
    includeFontMargins: true,
  }),
});

export const line = style({
  display: 'inline-block',
  position: 'relative',
  zIndex: 1,
  color: colorVars.white.css(),
  WebkitTextFillColor: colorVars.white.css(),
  // textShadow: `${dropShadowVars.offsetX.css()} ${dropShadowVars.offsetY.css()} ${dropShadowVars.blur.css()} ${dropShadowVars.color.css()}`,
});

export const homeTitle = style({});

// HOME FR
export const homeFirstLine_fr = style({
  fontSize: '1.3em',
});
export const homeSecondLine_fr = style({
  fontSize: '1.1em',
});

// HOME EN
export const homeFirstLine_en = style({
  fontSize: '1.31em',
});

export const homeSecondLine_en = style({
  fontSize: '1.2em',
});

export const systemsTitle = style({});

// Systems FR
export const systemsFirstLine_fr = style({
  fontSize: '1.1em',
});
export const systemsSecondLine_fr = style({
  fontSize: '1em',
});

// Systems EN
export const systemsFirstLine_en = style({
  fontSize: '1.1em',
});
export const systemsSecondLine_en = style({
  fontSize: '1em',
});
