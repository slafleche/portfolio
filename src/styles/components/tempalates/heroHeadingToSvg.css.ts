import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { heroFontVariants } from '../../../tokens/fontVariants/hero';
import { colorVars } from '../../../tokens/global.tokens';
import { backgrounds } from '../../helpers/background.helper';
import { margins, paddings } from '../../helpers/spacing.helper';
import { fontStylesFromFontVariant } from '../../helpers/typography.helper';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  ...backgrounds({ color: colorVars.black }),
});

export const viewPort = style({
  display: 'inline-flex',
  ...backgrounds({ color: 'orange' }),
  ...margins({ bottom: m(20) }),
  boxSizing: 'border-box',
  ...paddings({ vertical: m(1), horizontal: m(0) }),
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
export const systemsFr = style({
  lineHeight: 1.1,
});

export const systemsFirstLine_fr = style({
  fontSize: '1em',
});
export const systemsSecondLine_fr = style({
  fontSize: '1.5em',
  lineHeight: 1,
});

// Systems EN
export const systemsEn = style({
  lineHeight: 1.1,
});

export const systemsFirstLine_en = style({
  fontSize: '1.5em',
  lineHeight: 1,
});
export const systemsSecondLine_en = style({
  fontSize: '1.2em',
  lineHeight: 1.2,
});
