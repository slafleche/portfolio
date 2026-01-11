import { style } from '@vanilla-extract/css';
import { m, mEm, mPercent } from 'css-calipers';

import { fontFamilies } from '../../tokens/fontFamilies.tokens';
import { glassyButtonCupped } from '../../tokens/glassy.tokens';
import { colorVars, themeColours } from '../../tokens/global.tokens';
import borders from '../helpers/borders.helper';
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
});

export const scoopedGradient = style({
  ...gradientAsBgImg(glassyButtonCupped.gradient),
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
