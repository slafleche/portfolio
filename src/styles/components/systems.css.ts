import { style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient.helper';
import { systemsHeroGradient } from '../componentTokens/systems.component.tokens';
import { m } from 'css-calipers';

export const heroOverlay = style({
  position: 'relative',
  pointerEvents: 'none',
  ...makeCardGradient(systemsHeroGradient, {
    linearDirection: m(95, 'deg'),
  }),
});
