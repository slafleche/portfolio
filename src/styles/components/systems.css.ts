import { style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient';
import { systemsHeroGradient } from '../componentTokens/systems.componentTokens';
import { m } from '../measurementKit';

export const heroOverlay = style(
  makeCardGradient(systemsHeroGradient, {
    linearDirection: m(95, 'deg'),
  }),
);
