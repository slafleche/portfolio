import { style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient.helper';
import { systemsHeroGradient } from '../componentTokens/systems.componentTokens';
import { m } from 'css-calipers';

export const heroOverlay = style({
  position: 'relative',
  pointerEvents: 'none',
  // zIndex: 1,
  ...makeCardGradient(systemsHeroGradient, {
    linearDirection: m(95, 'deg'),
  }),
});
