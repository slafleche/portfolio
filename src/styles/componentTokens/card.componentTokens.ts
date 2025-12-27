import { color } from '../helpers/colorWrap.helper';
import type { CardGradientPack } from '../helpers/cardGradient.helper';
import { themeColours } from '../../tokens/global.tokens';

export type { CardGradientPack } from '../helpers/cardGradient.helper';

export const cardGradient_cc: CardGradientPack = {
  linear: [
    {
      color: color('#F40009'),
      at: 0,
    },
    {
      color: color('#490C2A'),
      at: 100,
    },
  ],
  spots: [
    // {
    //   color: color('#ffae00'),
    //   x: 80,
    //   y: 100,
    //   scale: 80,
    // },
    // {
    //   color: color('#bd08b4').alpha(0.7),
    //   x: 95,
    //   y: 48,
    //   scale: 80,
    //   blendMode: 'normal',
    // },
    // {
    //   color: color('#cbb358').alpha(0.8),
    //   x: 20,
    //   y: 100,
    //   scale: 75,
    //   blendMode: 'normal',
    // },
    // {
    //   color: color('#b7910a').alpha(0.2),
    //   x: 17,
    //   y: 98,
    //   scale: 85,
    // },
    // {
    //   color: color('#4271bb').alpha(0.6),
    //   x: 10,
    //   y: 56,
    //   scale: 100,
    // },
  ],
};

export const cardGradient_ea: CardGradientPack = {
  linear: [
    {
      color: color('#0083B7'),
      at: 0,
    },
    {
      color: color('#113fab'),
      at: 100,
    },
  ],
};

export const cardGradient_banq: CardGradientPack = {
  linear: [
    {
      color: color('#0e0d0f'),
      at: 0,
    },
    {
      color: color('#221f28'),
      at: 100,
    },
  ],
};

export const cardGradient_hs: CardGradientPack = {
  linear: [
    {
      color: color('#E03035'),
      at: 0,
    },
    {
      color: color('#ff4c46'),
      at: 100,
    },
  ],
};

export const cardGradient_king: CardGradientPack = {
  linear: [
    {
      color: color('#FFB800'),
      at: 0,
    },
    {
      color: color('#b16e08'),
      at: 100,
    },
  ],
};
