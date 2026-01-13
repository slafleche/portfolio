import { globalStyle, style } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';

import { fontFamilies } from '../../tokens/fontFamilies.tokens';
import { formFontVariants } from '../../tokens/fontVariants/forms';
import { formTokens } from '../../tokens/forms.tokens';
import { glassyButtonTokens } from '../../tokens/glassy.tokens';
import { colors, colorVars } from '../../tokens/global.tokens';
import { layoutVars } from '../../tokens/layout.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { privacyTokens } from '../../tokens/privacy.tokens';
import backdropFilters from '../helpers/backdropFilter.helper';
import { makeGlassSurface } from '../helpers/glassy.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import {
  fontStylesFromFontVariant,
  relativeFontWeight,
} from '../helpers/typography.helper';
import * as l from '../layout.css';
import { globalMediaQueryStyle } from '../responsive/mediaQueries';

export const container = style({
  position: 'relative',
  width: '100%',
  maxWidth: privacyTokens.layout.maxWidth.css(),
  ...margins({
    horizontal: 'auto',
  }),
  ...paddings(privacyTokens.layout.paddings),
  display: 'grid',
  gap: privacyTokens.layout.sectionGap.css(),
});

export const headerStack = style({
  display: 'grid',
  gap: privacyTokens.header.gap.css(),
});

export const backLink = style({
  position: 'absolute',
  top: privacyTokens.backLink.offset.css(),
  right: privacyTokens.backLink.offset.css(),
  width: privacyTokens.backLink.size.css(),
  height: privacyTokens.backLink.size.css(),
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  overflow: 'hidden',
});

export const closeButtonWrap = style({
  position: 'absolute',
  top: '50%',
  right: privacyTokens.backLink.offset.double().css(),
  transform: 'translateY(-50%)',
  width: glassyButtonTokens.size.css(),
  height: glassyButtonTokens.size.css(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
});

export const privacyFinePrint = style({
  fontSize: '0.9rem',
  textAlign: 'center',
  color: formTokens.privacy.text.color.css(),
  ...fontStylesFromFontVariant({
    variant: formFontVariants.hints,
  }),
});

export const link = style({
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  color: formTokens.privacy.text.color.css(),
  textDecoration: 'underline',
  textDecorationThickness: 'from-font',
  textUnderlineOffset: 4,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
    '&:focus, &:focus-visible': {
      outline: 'none',
      ...boxShadow(formTokens.field.focusVisible.shadow),
    },
  },
});

export const overlay = style({
  position: 'fixed',
  inset: 0,
  // backgroundColor: colorVars.black.alpha(0.85).css(),
  zIndex: 1100,
});

export const dialog = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'center',
  ...paddings({
    vertical: m(0),
    horizontal: m(6),
  }),
  overflow: 'hidden',
  zIndex: 1101,
});

export const panel = style({
  position: 'relative',
  backgroundColor: colorVars.bodyBg.css(),
  color: colorVars.bodyFg.css(),
  width: '100%',
  height: '100%',
  maxHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
});

globalStyle(`.${panel}.${l.content}`, {
  maxWidth: '100%',
});

export const header = style({
  position: 'fixed',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
  width: '100%',
  maxWidth: privacyTokens.layout.maxWidth.css(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...backdropFilters({
    blur: m(10),
    saturate: mPercent(100),
    contrast: mPercent(100),
    brightness: mPercent(100),
    backgroundColor: colors.transparent,
  }),
  minHeight: glassyButtonTokens.size.css(),
  ...paddings({
    vertical: privacyTokens.backLink.offset.multiply(2),
    horizontal: m(0),
  }),
});

export const glassyBack = style({
  ...makeGlassSurface({
    saturate: mPercent(100),
    contrast: mPercent(100),
    brightness: mPercent(100),
    backgroundColor: colors.transparent,
  }),
});

export const title = style({
  color: privacyTokens.title.color.css(),
  ...paddings({
    horizontal: m(80),
  }),
});

globalStyle(`.${title}[data-modal="title"]`, {
  ...margins(m(0)),
  ...paddings({
    top: 0,
  }),
  ...relativeFontWeight(fontFamilies.objectSans, mPercent(80)),
  fontSize: '1.2em',
  lineHeight: 1.2,
});

export const content = style({
  position: 'relative',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  ...paddings({
    horizontal: m(0),
    bottom: 0,
  }),
  ...margins({
    bottom: 0,
  }),
});

globalStyle(`.${container}`, {
  ...globalMediaQueryStyle({
    compact: {
      ...paddings({
        horizontal: anchorMenuVars.handle.sizeWithBorder,
      }),
    },
  }),
});

globalStyle(`.${container} h3:not([data-ui="heading"])`, {
  ...globalMediaQueryStyle({
    compact: {
      textAlign: 'left',
      fontSize: '1em',
    },
  }),
});

export const scrollArea = style({
  height: '100%',
  overflowY: 'auto',
  scrollbarGutter: 'stable',
});
export const text = style({
  width: '100%',
  maxWidth: layoutVars.compact.maxWidth.css(),
  margin: 'auto',
});
