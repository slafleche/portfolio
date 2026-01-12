import {
  type ComplexStyleRule,
  globalStyle,
  style,
} from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { glassVars } from '../../tokens/glassy.tokens';
import backdropFilters from '../helpers/backdropFilter.helper';
import { backgrounds } from '../helpers/background.helper';
import borders from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

export const glassLink = style({
  position: 'relative',
  width: glassVars.glassyLinks.size.css(),
  height: glassVars.glassyLinks.size.css(),
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
  transition: 'transform 200ms ease, box-shadow 200ms ease',
  ...boxShadow({
    x: m(0),
    y: m(20),
    blur: m(30),
    alpha: 0.15,
  }),
  zIndex: 1,
  overflow: 'hidden',
  selectors: {
    ...mediaQueryStyle({
      notCompact: {
        selectors: {
          '&:hover': {
            cursor: 'pointer',
            transform: `scale(${glassVars.glassyLinks.hoverFocus.scale})`,
            ...boxShadow({
              x: m(0),
              y: m(24),
              blur: m(36),
              alpha: 0.25,
            }),
          },
        },
      },
    }),
  },
});

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

export const glassyButtonHover = style({});

globalStyle(
  `.${glassLink}:hover ${glassLinkShine}, 
   .${glassLink}:focus ${glassLinkShine},
   .${glassyButtonHover}:hover ${glassLinkShine}, 
   .${glassyButtonHover}:focus ${glassLinkShine}`,
  {
    transform: 'skewX(45deg) translateX(-220%)',
    opacity: 1,
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transform: 'skewX(45deg) translateX(220%)',
        opacity: 0,
      },
    },
  },
);
