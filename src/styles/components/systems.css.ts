import { style } from '@vanilla-extract/css';
import { makeCardGradient } from '../helpers/cardGradient';
import { systemsHeroGradient } from '../vars/systems.vars';
import { m } from '../helpers/measurement';

export const heroOverlay = style(
  makeCardGradient(systemsHeroGradient, {
    linearDirection: m(95, 'deg'),
  }),
);
