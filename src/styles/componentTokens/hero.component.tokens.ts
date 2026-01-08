import { m, mPercent } from 'css-calipers';

import { color } from '../helpers/colorWrap.helper';
import type { Stop } from '../helpers/gradients.helper';
import type { CardGradientPack } from './systems.component.tokens';

export const heroVars = {
  background: {
    linear: [
      {
        color: color('#160d36'),
        at: mPercent(0),
      },
      {
        color: color('#6f4ed1'),
        at: mPercent(100),
      },
    ] as Stop[],
    videoOpacity: 0.8,
  },
  fontLoading: {
    waitForFontsTimeoutMs: 1500,
  },

  paddings: {
    top: m(40),
    bottom: m(40),
  },
  queries: {
    compact: m(800),
  },
} as const;

export type HeroVars = typeof heroVars;

export const heroGradient: CardGradientPack = {
  linear: [
    {
      color: color('oklch(12% 0.07 268 / 0)'),
      at: 0,
    },
    {
      color: color('oklch(30% 0.14 312 / 0.3)'),
      at: 55,
    },
    {
      color: color('oklch(46% 0.18 336 / 0.6)'),
      at: 100,
    },
  ],
  spots: [
    {
      color: color('#7a2858').alpha(0.8),
      x: 20,
      y: 110,
      scale: 40,
      blendMode: 'multiply',
    },
    {
      color: color('#287a6e').alpha(0.3),
      x: 20,
      y: 33,
      scale: 80,
      blendMode: 'color-dodge',
    },
    {
      color: color('#3c8dbe').alpha(0.3),
      x: 80,
      y: 43,
      scale: 50,
      softenL: 10,
      blendMode: 'multiply',
    },
    // {
    //   color: color('#00ff6e').alpha(0.3),
    //   x: 80,
    //   y: 60,
    //   scale: 80,
    //   blendMode: 'normal',
    // },
    {
      color: color('#ff00bf').alpha(0.1),
      x: 66,
      y: 70,
      scale: 70,
      blendMode: 'multiply',
    },
    {
      color: color('oklch(46% 0.18 336 / 0.3)'),
      x: 20,
      y: 50,
      scale: 40,
      blendMode: 'multiply',
    },
  ],
};
