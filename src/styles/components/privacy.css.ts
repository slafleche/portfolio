import { keyframes, style } from '@vanilla-extract/css';
import { paddings } from '../helpers/spacing';
import borders from '../helpers/borders';
import { privacyTokens } from '../../tokens/privacy.tokens';

export const container = style({
  position: 'relative',
  width: '100%',
  maxWidth: privacyTokens.layout.maxWidth.css(),
  margin: '0 auto',
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
  fontSize: privacyTokens.title.fontSize,
  fontWeight: privacyTokens.title.fontWeight,
  color: privacyTokens.title.color.css(),
});

export const updated = style({
  margin: 0,
  color: privacyTokens.updated.color.css(),
  fontSize: privacyTokens.updated.fontSize,
});

const sheenSweep = keyframes({
  '0%': {
    transform: 'skewX(45deg) translateX(220%)',
  },
  '100%': {
    transform: 'skewX(45deg) translateX(-220%)',
  },
});

const sheenGradient = privacyTokens.backLink.sheen;

export const backLink = style({
  position: 'absolute',
  top: privacyTokens.backLink.offset.css(),
  right: privacyTokens.backLink.offset.css(),
  width: privacyTokens.backLink.size.css(),
  height: privacyTokens.backLink.size.css(),
  borderRadius:
    privacyTokens.backLink.borders.intent.radius?.all.css() ?? '0',
  ...borders(privacyTokens.backLink.borders.intent),
  background: privacyTokens.backLink.background.css(),
  color: privacyTokens.backLink.textColor.css(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: privacyTokens.backLink.iconSize.css(),
  fontWeight: privacyTokens.backLink.fontWeight,
  boxShadow: privacyTokens.backLink.shadowRest,
  backdropFilter: `blur(${privacyTokens.backLink.backdropBlur.css()})`,
  WebkitBackdropFilter: `blur(${privacyTokens.backLink.backdropBlur.css()})`,
  transition: privacyTokens.backLink.transition,
  textDecoration: 'none',
  overflow: 'hidden',
  selectors: {
    '&::after': {
      content: '',
      position: 'absolute',
      inset: '-25%',
      background: sheenGradient,
      transform: 'skewX(45deg) translateX(220%)',
      opacity: 0,
      pointerEvents: 'none',
      transition: 'opacity 180ms ease',
    },
    '&:hover': {
      background: privacyTokens.backLink.hoverBackground.css(),
      boxShadow: privacyTokens.backLink.shadowHover,
      transform: 'translateY(-2px)',
    },
    '&:focus-visible': {
      outline: 'none',
      background: privacyTokens.backLink.hoverBackground.css(),
      boxShadow: `${privacyTokens.backLink.shadowHover}, 0 0 0 ${privacyTokens.backLink.focusRingWidth.css()} ${privacyTokens.backLink.focusRingColor.css()}`,
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: privacyTokens.backLink.shadowRest,
    },
    '&:hover::after, &:focus-visible::after': {
      opacity: 1,
      animation: `${sheenSweep} 520ms ease`,
    },
    '&:active::after': {
      opacity: 0,
    },
  },
});
