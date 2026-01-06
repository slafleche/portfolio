import { style } from '@vanilla-extract/css';
import { margins, paddings } from '../helpers/spacing.helper';
import { privacyTokens } from '../../tokens/privacy.tokens';
import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';
import { formTokens } from '../../tokens/forms.tokens';
import { formFontVariants } from '../../tokens/fontVariants/forms';
import { boxShadow } from '../helpers/shadow.helper';
import { colorVars } from '../../tokens/global.tokens';
import { m } from 'css-calipers';

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
  // ...backdropFilters.style({ blur: glassVars.blur.double() }),
  zIndex: 1100,
});

export const dialog = style({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...paddings({
    vertical: m(8),
    horizontal: m(6),
  }),
  zIndex: 1101,
});

export const panel = style({
  position: 'relative',
  width: 'min(70ch, 90vw)',
  maxHeight: '80vh',
  ...paddings({
    vertical: m(12),
    horizontal: m(11),
  }),
  // ...borders(formTokens.field.borders),
  backgroundColor: colorVars.bodyBg.css(),
  color: colorVars.bodyFg.css(),
  // ...boxShadow({
  //   x: m(0),
  //   y: m(3),
  //   blur: m(12),
  //   color: colorVars.black,
  //   alpha: 0.35,
  // }),
  overflowY: 'auto',
  display: 'grid',
  gap: formTokens.layout.fieldGap.css(),
});

export const title = style({
  margin: 0,
  // fontSize: '1.6rem',
  // fontWeight: 700,
  // margin: 0,
  color: privacyTokens.title.color.css(),
});

export const updated = style({
  margin: 0,
  // color: colorVars.bodyFg.alpha(0.7).css(),
  // fontSize: '0.9rem',
  //   margin: 0,
  // color: privacyTokens.updated.color.css(),
});

export const body = style({
  // fontSize: '0.95rem',
  // lineHeight: 1.6,
});
