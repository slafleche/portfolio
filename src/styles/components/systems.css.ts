import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { systemsHeroGradient } from '../componentTokens/systems.component.tokens';
import { makeCardGradient } from '../helpers/cardGradient.helper';

export const heroOverlay = style({
  position: 'relative',
  pointerEvents: 'none',
  ...makeCardGradient(systemsHeroGradient, {
    linearDirection: m(95, 'deg'),
  }),
});
