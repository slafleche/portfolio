import { globalStyle, style } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';

import { formFontVariants } from '../../tokens/fontVariants/forms';
import { formTokens } from '../../tokens/forms.tokens';
import { glassyButtonTokens } from '../../tokens/glassy.tokens';
import { colors, colorVars } from '../../tokens/global.tokens';
import { layoutVars } from '../../tokens/layout.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { privacyTokens } from '../../tokens/privacy.tokens';
import { makeGlassSurface } from '../helpers/glassy.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { fontStylesFromFontVariant } from '../helpers/typography.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

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
  right: privacyTokens.backLink.offset.css(),
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
  color: formTokens.privacy.text.color.css(),
  ...fontStylesFromFontVariant({
    variant: formFontVariants.hints,
  }),
  textAlign: 'left',
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
  maxWidth: privacyTokens.layout.maxWidth.css(),
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
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
  minHeight: glassyButtonTokens.size.css(),
  ...paddings({
    vertical: privacyTokens.backLink.offset,
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
});

globalStyle(`.${title}[data-modal="title"]`, {
  ...margins(m(0)),
  ...paddings({
    top: 0,
  }),
});

export const content = style({
  position: 'relative',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  ...paddings({
    horizontal: layoutVars.content.padding,
    bottom: 0,
  }),
  ...margins({
    bottom: 0,
  }),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...paddings({
          horizontal: anchorMenuVars.handle.sizeWithBorder,
        }),
      },
    }),
  },
});

export const scrollArea = style({
  height: '100%',
  overflowY: 'auto',
  scrollbarGutter: 'stable',
});
export const text = style({});
