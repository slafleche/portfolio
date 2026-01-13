import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { formFontVariants } from '../../tokens/fontVariants/forms';
import { formTokens } from '../../tokens/forms.tokens';
import { glassyButtonTokens } from '../../tokens/glassy.tokens';
import { colorVars } from '../../tokens/global.tokens';
import { layoutVars } from '../../tokens/layout.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { privacyTokens } from '../../tokens/privacy.tokens';
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

export const header = style({
  display: 'grid',
  gap: privacyTokens.header.gap.css(),
});

// const sheenSweep = keyframes({
//   '0%': {
//     transform: 'skewX(45deg) translateX(220%)',
//   },
//   '100%': {
//     transform: 'skewX(45deg) translateX(-220%)',
//   },
// });

// const sheenGradient = privacyTokens.backLink.sheen;

export const backLink = style({
  position: 'absolute',
  top: privacyTokens.backLink.offset.css(),
  right: privacyTokens.backLink.offset.css(),
  width: privacyTokens.backLink.size.css(),
  height: privacyTokens.backLink.size.css(),
  zIndex: 1,
  //   ...borders(privacyTokens.backLink.borders),
  //   color: privacyTokens.backLink.text.color.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  //   fontSize: privacyTokens.backLink.iconSize.css(),
  //   backdropFilter: `blur(${privacyTokens.backLink.backdropBlur.css()})`,
  //   WebkitBackdropFilter: `blur(${privacyTokens.backLink.backdropBlur.css()})`,
  //   transition: privacyTokens.backLink.transition,
  textDecoration: 'none',
  overflow: 'hidden',
});

export const closeButtonWrap = style({
  position: 'sticky',
  top: privacyTokens.backLink.offset.css(),
  alignSelf: 'start',
  justifySelf: 'end',
  marginRight: privacyTokens.backLink.offset.css(),
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
  backgroundColor: colorVars.black.alpha(0.85).css(),
  zIndex: 1100,
});

export const dialog = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  ...paddings({
    vertical: m(8),
    horizontal: m(6),
  }),
  overflowY: 'auto',
  scrollbarGutter: 'stable',
  zIndex: 1101,
});

export const panel = style({
  position: 'relative',
  backgroundColor: colorVars.bodyBg.css(),
  color: colorVars.bodyFg.css(),
  width: '100%',
  maxWidth: privacyTokens.layout.maxWidth.css(),
  display: 'grid',
  gap: formTokens.layout.fieldGap.css(),
});

export const title = style({
  color: privacyTokens.title.color.css(),
});

globalStyle(`.${title}[data-modal="title"]`, {
  ...margins(m(0)),
  ...paddings({
    top: 0,
    horizontal: glassyButtonTokens.iconSize
      .add(privacyTokens.backLink.offset)
      .multiply(2),
  }),
});

export const content = style({
  ...paddings({
    horizontal: layoutVars.content.padding,
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
export const text = style({});
