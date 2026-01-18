import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { colorVars } from '../../tokens/global.tokens';
import { outlinesTokens } from '../../tokens/outlines.tokens';
import borders from '../helpers/borders.helper';
import { outlines } from '../helpers/outlines.helper';
import { paddings } from '../helpers/spacing.helper';

export const link = style({
  position: 'fixed',
  top: outlinesTokens.defaults.width.add(outlinesTokens.defaults.offset.double()).css(),
  left: '50%',
  transform: 'translate(-50%, -200%)',
  backgroundColor: colorVars.bodyBg.css(),
  color: colorVars.bodyFg.css(),
  fontSize: '1.2rem',
  ...paddings({
    vertical: m(8),
    horizontal: m(22),
  }),
  ...borders.radii(m(2)),
  textDecoration: 'none',
  zIndex: 200,
  transition: 'transform 180ms ease-in-out',
  border: 'none',
  ...outlines(),
  selectors: {
    '&:focus, &:focus-visible': {
      transform: 'translate(-50%, 0)',
    },
  },
});
