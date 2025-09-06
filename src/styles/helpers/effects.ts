import { colors, fontVars } from '../vars.css';
import { absolutePosition, flexPosition } from '../helpers/positioning';
import * as csstype from 'csstype';
import { ReducedMotion, reducedMotion } from './accessibility';

export const roundButton = (buttonSize: csstype.Property.Width) => {
  return {
    ...flexPosition.center(),
    position: 'relative',
    textDecoration: 'none',
    borderRadius: '50%',
    fontWeight: fontVars.body.semiBold,
    transition: 'background, color 0.3s, 0.2s ease-in',
    width: buttonSize,
    height: buttonSize,
    minHeight: buttonSize,
    minWidth: buttonSize,
    border: `solid ${colors.brand.css()} 3px`,
    ...reducedMotion(ReducedMotion.off, {
      border: `solid ${colors.white.css()} 1px`,
    }),
    selectors: {
      ['&&']: {
        color: colors.brand.css(),
        outlineColor: colors.white.css(),
      },
      ['&:after']: {
        ...reducedMotion(ReducedMotion.off, {
          content: '',
          ...absolutePosition.fullSize(),
          border: `solid ${colors.brand.css()} 3px`,
          borderRadius: '50%',
          transform: 'scale(1)',
          transition: 'opacity, transform, filter 0.3s, 0.2s ease-out',
        }),
      },
      ['&:hover:after, &:focus:after']: {
        opacity: 0,
        transform: 'scale(2)',
      },

      ['&:hover, &:focus']: {
        backgroundColor: colors.brand.css(),
        color: colors.white.css(),
      },
      ['&:focus-visible, &.focus-visible']: {
        outline: `solid ${colors.white.css()} 1px`,
        outlineStyle: 'dotted',
        outlineOffset: '-5px',
      },
    },
  };
};
