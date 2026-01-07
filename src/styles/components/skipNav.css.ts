import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';
import { colorVars } from '../../tokens/global.tokens';
import { paddings } from '../helpers/spacing.helper';
import borders from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';

export const link = style({
  position: 'fixed',
  left: '50%',
  transform: 'translate(-50%, -200%)',
  top: '2px',
  backgroundColor: colorVars.bodyBg.css(),
  color: colorVars.bodyFg.css(),
  ...paddings({
    vertical: m(2),
    horizontal: m(4),
  }),
  ...borders.radii(m(2)),
  textDecoration: 'none',
  ...boxShadow({
    x: m(0),
    y: m(1),
    blur: m(4),
    color: colorVars.black,
    alpha: 0.25,
  }),
  zIndex: 200,
  transition:
    'transform 180ms ease-in-out, opacity 180ms ease-in-out',
  opacity: 0,
  fontWeight: 600,
  selectors: {
    '&:focus, &:focus-visible': {
      transform: 'translate(-50%, 0)',
      opacity: 1,
    },
  },
});
