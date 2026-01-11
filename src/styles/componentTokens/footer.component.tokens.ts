import { m, mPercent } from 'css-calipers';

import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import { themeColours } from '../../tokens/global.tokens';
import { textStyleVars } from '../../tokens/textStyles.tokens';

// const footerGradient: CardGradientPack = {
//   linear: [
//     {
//       color: color('#51287a'),
//       at: 0,
//     },
//     {
//       color: color('#51287a'),
//       at: 30,
//       blend: 1,
//     },
//     {
//       color: color('#5B66D6'),
//       at: 80,
//       blend: 0.3,
//     },
//     {
//       color: color('#6E4DCC'),
//       at: 100,
//     },
//   ],
//   spots: [
//     {
//       color: color('#9BE8FB').alpha(0.5),
//       x: 20,
//       y: 110,
//       scale: 80,
//       blendMode: 'normal',
//     },
//     {
//       color: color('#51287a').alpha(0.4),
//       x: 90,
//       y: 53,
//       scale: 100,
//       softenL: 10,
//       blendMode: 'normal',
//     },
//     {
//       color: color('#287a52').alpha(0.7),
//       x: 63,
//       y: 100,
//       scale: 80,
//       blendMode: 'normal',
//     },
//     {
//       color: color('#00ff6e').alpha(0.3),
//       x: 80,
//       y: 60,
//       scale: 80,
//       blendMode: 'normal',
//     },
//     {
//       color: color('#ff00bf').alpha(0.6),
//       x: 66,
//       y: 70,
//       scale: 70,
//       blendMode: 'normal',
//     },
//   ],
// };

export const gradient = {
  gradientAngle: m(180, 'deg'),
  gradientStops: [
    {
      color: themeColours.gradients.main.start,
      at: mPercent(0),
    },
    {
      color: themeColours.gradients.main.middle,
      at: mPercent(50),
    },
    {
      color: themeColours.gradients.main.end,
      at: mPercent(100),
    },
  ] as const,
} as const;

export const footerVars = {
  heading: typographyFontVariants.h2,
  body: textStyleVars.paragraph,
  gradient,
} as const;

export type FooterVars = typeof footerVars;

export const footerGradientConfig = {
  angle: footerVars.gradient.gradientAngle,
  stops: footerVars.gradient.gradientStops.map((stop) => ({
    color: stop.color,
    at: stop.at,
  })),
};
