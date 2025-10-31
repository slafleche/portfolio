import { color } from '@/styles/helpers/colorWrap';
import type { CardGradientPack } from '../helpers/cardGradient';

export const systemsHeroGradient: CardGradientPack = {
  linear: [
    {
      color: color('#51287a'),
      at: 0,
    },
    {
      color: color('#7139a5'),
      at: 100,
    },
  ],
  spots: [
    {
      color: color('#ffae00'),
      x: 80,
      y: 100,
      scale: 80,
    },
    {
      color: color('#bd08b4').alpha(0.7),
      x: 95,
      y: 48,
      scale: 80,
      blendMode: 'normal',
    },
    {
      color: color('#cbb358').alpha(0.8),
      x: 20,
      y: 100,
      scale: 75,
      blendMode: 'normal',
    },
    {
      color: color('#b7910a').alpha(0.2),
      x: 17,
      y: 98,
      scale: 85,
    },
    {
      color: color('#4271bb').alpha(0.6),
      x: 10,
      y: 56,
      scale: 100,
    },
  ],
};

export type { CardGradientPack } from '../helpers/cardGradient';
