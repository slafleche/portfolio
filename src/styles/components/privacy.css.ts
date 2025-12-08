import { style } from '@vanilla-extract/css';
import { margins, paddings } from '../helpers/spacing.helper';
import { privacyTokens } from '../../tokens/privacy.tokens';

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

export const title = style({
  margin: 0,
  color: privacyTokens.title.color.css(),
});

export const updated = style({
  margin: 0,
  color: privacyTokens.updated.color.css(),
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
