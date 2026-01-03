import { color } from '../helpers/colorWrap.helper';
import type { CardGradientPack } from '../helpers/cardGradient.helper';

const darkPurple = color('#020014');

export const systemsHeroGradient: CardGradientPack = {
  linear: [
    {
      color: darkPurple,
      at: 0,
    },
    {
      color: color('#15021d'),
      at: 100,
    },
  ],
  spots: [
    {
      color: color('hsl(278 51% 15%)'), // lightPurple
      x: 80,
      y: 100,
      scale: 80,
    },
    {
      color: color('hsl(295 85% 24%)').alpha(0.8), // bright magenta purple
      x: 95,
      y: 48,
      scale: 80,
      blendMode: 'normal',
    },
    {
      color: color('hsl(284 72% 32%)').alpha(0.7), // mid vibrant purple
      x: 20,
      y: 100,
      scale: 75,
      blendMode: 'normal',
    },
    {
      color: color('hsl(310 40% 12%)').alpha(0.4), // wine accent
      x: 17,
      y: 98,
      scale: 85,
    },
    {
      color: color('hsl(0 77% 65%)')
        .mix(color('hsl(310 40% 12%)'), 0.2)
        .alpha(0.3),
      x: 10,
      y: 56,
      scale: 100,
    },
  ],
};

export type { CardGradientPack } from '../helpers/cardGradient.helper';
