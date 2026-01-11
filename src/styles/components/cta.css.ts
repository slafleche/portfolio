import { style } from '@vanilla-extract/css';
import { m, mEm, mPercent } from 'css-calipers';

import { fontFamilies } from '../../tokens/fontFamilies.tokens';
import { colorVars, themeColours } from '../../tokens/global.tokens';
import borders from '../helpers/borders.helper';
import { color } from '../helpers/colorWrap.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { relativeFontWeight } from '../helpers/typography.helper';

export const root = style({
  overflow: 'hidden',
  position: 'relative',
  ...margins({ top: m(40) }),
  ...gradientAsBgImg(buildLinear(themeColours.gradients.ctaConfig)),
  fontSize: '22px',
  lineHeight: 1,
  ...relativeFontWeight(fontFamilies.objectSans, mPercent(0)),
  ...paddings(m(12)),
  ...borders.radii([
    m(40),
    m(60),
  ]),
  userSelect: 'none',
  color: colorVars.black.lighten(0.1).css(),
  textDecoration: 'none',
  opacity: 0,
  pointerEvents: 'none',
  selectors: {
    '&:hover, &:focus': {
      transform: 'scale(1.015)',
    },
    '&[data-ready="true"]': {
      opacity: 1,
      pointerEvents: 'auto',
    },
  },
});

export const ctaInner = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
  ...paddings({
    vertical: m(12),
    horizontal: m(18),
  }),
  ...borders.radii([
    m(30),
    m(40),
  ]),
  ...gradientAsBgImg(
    buildLinear({
      angle: m(0, 'deg'),
      stops: [
        {
          at: mPercent(0),
          color: color('#e7e7e7')
            .blend.multiply({
              ratio: 0.5,
            })
            .alpha(0.2),
        },
        {
          at: mPercent(100),
          color: color('#f7f8f7')
            .blend.multiply()
            .darken(0.8)
            .mix(themeColours.secondary, 0.1)
            .alpha(0.4),
        },
      ],
    }),
  ),
});

export const ctaText = style({
  fontSize: '25px',
  color: colorVars.white.css(),
});

export const ctaIcon = style({
  color: colorVars.white.css(),
  width: '36px',
  height: '36px',
  transform: 'rotate(135deg)',
  ...margins({ right: mEm(0.5) }),
});
