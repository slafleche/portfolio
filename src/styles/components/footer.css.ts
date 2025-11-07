import { globalStyle, style } from '@vanilla-extract/css';
import type { ComplexStyleRule } from '@vanilla-extract/css';
import { noiseBg } from '../helpers/noiseSVG.helper';

export const root = style({
  position: 'relative',
  marginTop: '96px',
  padding: '80px 24px 120px',
  background: 'linear-gradient(135deg, #f97794 10%, #623aa2 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  rowGap: '32px',
  color: '#ffffff',
  width: '100%',
  minHeight: '420px',
  textAlign: 'center',
  overflow: 'hidden',
});

globalStyle(`${root} > *:not(:first-child)`, {
  position: 'relative',
  zIndex: 1,
});

export const heading = style({
  position: 'relative',
  zIndex: 1,
  fontSize: '48px',
  fontWeight: 700,
  margin: 0,
});

export const content = style({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  maxWidth: '680px',
  margin: 0,
  lineHeight: 1.6,
  opacity: 0.9,
});

export const links = style({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '40px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const overlay = style({
  position: 'absolute',
  inset: '0',
  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  background: 'rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(5px)',
  zIndex: 0,
  ...noiseBg({ opacity: 0.07 }),
});

const glassLinkBase: ComplexStyleRule = {
  position: 'relative',
  width: '100px',
  height: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(3px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 20px 30px rgba(0, 0, 0, 0.15)',
  overflow: 'hidden',
  transition: 'transform 200ms ease, box-shadow 200ms ease',
};

export const glassLink = style([
  glassLinkBase,
  {
    selectors: {
      '&:hover': {
        cursor: 'pointer',
        transform: 'translateY(-20px)',
        boxShadow: '0 24px 36px rgba(0, 0, 0, 0.25)',
      },
    },
  },
]);

const glassLinkShineBase: ComplexStyleRule = {
  display: 'block',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '50%',
  height: '100%',
  background: 'rgba(255, 255, 255, 0.5)',
  transform: 'skewX(45deg) translateX(220%)',
  transition: 'transform 400ms ease',
  zIndex: 0,
  pointerEvents: 'none',
  opacity: 0,
};

export const glassLinkShine = style(glassLinkShineBase);

globalStyle(`${glassLink}:hover ${glassLinkShine}`, {
  transform: 'skewX(45deg) translateX(-220%)',
  opacity: 1,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      transform: 'skewX(45deg) translateX(220%)',
      opacity: 0,
    },
  },
});

const iconBase: ComplexStyleRule = {
  width: '36px',
  height: '36px',
  display: 'block',
  opacity: 0.85,
  position: 'relative',
  zIndex: 1,
};

export const contactIcon = style(iconBase);
export const linkedInIcon = style(iconBase);
export const gitHubIcon = style(iconBase);
