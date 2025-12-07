import { globalStyle, style } from '@vanilla-extract/css';
import type { ComplexStyleRule } from '@vanilla-extract/css';
import { m } from 'css-calipers';
import { noiseBg } from '../helpers/noiseSVG.helper';
import { paddings, margins } from '../helpers/spacing.helper';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';
import backdropFilters from '../helpers/backdropFilter.helper';

export const root = style({
  position: 'relative',
  ...margins({
    top: m(96),
    horizontal: m(0),
    bottom: m(0),
  }),
  ...paddings({
    top: m(80),
    horizontal: m(24),
    bottom: m(120),
  }),
  ...backgrounds({
    image: 'linear-gradient(135deg, #f97794 10%, #623aa2 100%)',
  }),
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
  ...borders({
    top: {
      width: m(1),
      color: 'rgba(255, 255, 255, 0.2)',
    },
  }),
  ...backgrounds({ color: 'rgba(255, 255, 255, 0.06)' }),
  ...backdropFilters.style({ blur: m(5) }),
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
  ...borders({
    radius: m(8),
    width: m(1),
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  ...backgrounds({ color: 'rgba(255, 255, 255, 0.05)' }),
  ...backdropFilters.style({ blur: m(3) }),
  boxShadow: boxShadow({
    x: m(0),
    y: m(20),
    blur: m(30),
    alpha: 0.15,
  }),
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
        boxShadow: boxShadow({
          x: m(0),
          y: m(24),
          blur: m(36),
          alpha: 0.25,
        }),
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
  ...backgrounds({ color: 'rgba(255, 255, 255, 0.5)' }),
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
