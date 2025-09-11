import { ComplexStyleRule, StyleRule } from '@vanilla-extract/css';

// Reduced Motion
export enum ReducedMotion {
  on = 'reduce',
  off = 'no-preference',
}

export const reducedMotion = (
  preference: ReducedMotion,
  styles: ComplexStyleRule,
) => {
  return {
    '@media': {
      [`(prefers-reduced-motion: ${preference})`]: styles,
    },
  } as StyleRule;
};
