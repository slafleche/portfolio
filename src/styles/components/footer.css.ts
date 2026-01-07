import type { ComplexStyleRule } from '@vanilla-extract/css';
import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { layoutVars } from '../../tokens/layout.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import {
  footerGradientConfig,
  footerVars,
} from '../componentTokens/footer.component.tokens';
import backdropFilters from '../helpers/backdropFilter.helper';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import {
  componentMediaQueries,
  mediaQueryStyle,
} from '../responsive/mediaQueries';

export const root = style({
  position: 'relative',
  ...gradientAsBgImg(buildLinear(footerGradientConfig)),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  rowGap: '32px',
  color: '#ffffff',
  width: '100%',
  textAlign: 'center',
  overflow: 'hidden',

  ...paddings({
    vertical: layoutVars.contentPadding.multiply(1.5),
  }),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...paddings({
          top: anchorMenuVars.handle.sizeWithBorder.multiply(2),
          bottom: anchorMenuVars.handle.sizeWithBorder.multiply(1.5),
        }),
      },
    }),
  },
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
  lineHeight: 1,
  textAlign: 'center',
  fontSize: '28px',
  margin: 'auto',
  opacity: 0.9,
  ...paddings({
    bottom: m(0.5, 'em'),
  }),
});

export const links = style({
  position: 'relative',
  zIndex: 1,
  pointerEvents: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: footerVars.glassyLinks.gap.css(),
  ...margins({
    top: m(24),
  }),
  padding: 0,
  listStyle: 'none',
  selectors: {
    ...componentMediaQueries({
      footer_oneColumn: {
        flexDirection: 'column',
      },
    }),
  },
});

globalStyle(`${links} > *`, {
  pointerEvents: 'auto',
});

const glassLinkBase: ComplexStyleRule = {
  position: 'relative',
  width: footerVars.glassyLinks.size.css(),
  height: footerVars.glassyLinks.size.css(),
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
  ...boxShadow({
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
    zIndex: 1,
    selectors: {
      ...mediaQueryStyle({
        notCompact: {
          selectors: {
            '&:hover': {
              cursor: 'pointer',
              transform: `translateY(${footerVars.glassyLinks.hoverFocus.translateY.css()})`,
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
