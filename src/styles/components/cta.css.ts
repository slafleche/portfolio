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

export const cta = style({
  position: 'relative',
  ...margins({ top: m(40) }),
  ...gradientAsBgImg(buildLinear(themeColours.gradients.ctaConfig)),
  fontSize: '22px',
  lineHeight: 1,
  ...relativeFontWeight(fontFamilies.objectSans, mPercent(0)),
  ...paddings(m(10)),

  ...borders.radii([
    m(40),
    m(60),
  ]),

  userSelect: 'none',
  color: colorVars.black.lighten(0.1).css(),
  textDecoration: 'none',
  // ...boxShadow({
  //   x: m(0),
  //   y: m(1),
  //   blur: m(4),
  //   alpha: 0.15,
  //   color: colorVars.black,
  // }),
  // 3px 3px 6px #b8b9be, -3px -3px 6px #fff
  // ...boxShadow([
  //   {
  //     x: m(3),
  //     y: m(3),
  //     blur: m(6),
  //     color: color('#b8b9be'),
  //   },
  //   {
  //     x: m(-3),
  //     y: m(-3),
  //     blur: m(6),
  //     color: colorVars.white,
  //   },
  // ]),
  opacity: 0,
  pointerEvents: 'none',
  selectors: {
    '&:hover, &:focus-visible': {
      // transform: 'translateY(-2px)',
      // ...boxShadow({
      //   x: m(0),
      //   y: m(2),
      //   blur: m(8),
      //   alpha: 0.25,
      //   color: colorVars.black,
      // }),
      // outline: 'none',
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
  zIndex: 2,
  ...paddings({
    vertical: m(16),
    horizontal: m(26),
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
          color: color('#e7e7e7').blend.multiply({
            ratio: 0.5,
          }),
        },
        {
          at: mPercent(100),
          color: color('#f7f8f7')
            .blend.multiply()
            .darken(0.1)
            .mix(themeColours.secondary, 0.1),
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
  width: '46px',
  height: '46px',
  transform: 'rotate(135deg)',
  ...margins({ right: mEm(0.5) }),
  // selectors: {
  //   [`${cta}:hover &`]: {
  //     transform: 'translateX(6%)',
  //   },
  //   [`${cta}:focus-visible &`]: {
  //     transform: 'translateX(6%)',
  //   },
  // },
});

// box-shadow: 3px 3px 6px #b8b9be, -3px -3px 6px #fff;

// const ctaGradient = buildLinear({
//   angle: m(110, 'deg'),
//   stops: [
//     { color: themeColours.secondary, at: mPercent(0) },
//     { color: themeColours.brandMix, at: mPercent(50) },
//     { color: themeColours.secondary, at: mPercent(100) },
//   ],
// });
