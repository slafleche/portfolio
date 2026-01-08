import { m, r } from 'css-calipers';

import type { CardGradientPack } from '../styles/helpers/cardGradient.helper';
import { color } from '../styles/helpers/colorWrap.helper';

const cardGradient_cc: CardGradientPack = {
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

const cardGradient_ea: CardGradientPack = {
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

const cardGradient_banq: CardGradientPack = {
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

const cardGradient_hs: CardGradientPack = {
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

const cardGradient_kg: CardGradientPack = {
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

const defaultGradientDirection = m(95, 'deg');
export const wordMarkVars = {
  compact: {
    offset: m(-20),
  },
  cc: {
    gradients: {
      colors: cardGradient_cc,
      direction: defaultGradientDirection,
    },
    size: m(150),
    ratio: r(615.08, 192.94),
    logoAsBg: color('rgba(77, 4, 17, 0.11)'),
  },
  ea: {
    gradients: {
      colors: cardGradient_ea,
      direction: defaultGradientDirection,
    },
    size: m(150),
    ratio: r(998.014, 998.025),
    logoAsBg: color('#0083B7').darken(0.5).alpha(0.1),
  },
  banq: {
    gradients: {
      colors: cardGradient_banq,
      direction: defaultGradientDirection,
    },
    size: m(150),
    ratio: r(47.02762, 47.02762),
    logoAsBg: color('#0e0d0f').lighten(0.5).alpha(0.04),
  },
  hs: {
    gradients: {
      colors: cardGradient_hs,
      direction: defaultGradientDirection,
    },
    size: m(150),
    ratio: r(88.71465, 88.8469),
    logoAsBg: color('#E03035').darken(0.9).alpha(0.05),
  },
  kg: {
    gradients: {
      colors: cardGradient_kg,
      direction: defaultGradientDirection,
    },
    size: m(150),
    ratio: r(684.9532, 530),
    logoAsBg: color('#FFB800').darken(0.6).alpha(0.05),
  },
};
