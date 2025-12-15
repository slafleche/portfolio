import { style } from '@vanilla-extract/css';
import { mPercent } from 'css-calipers';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { colorVars } from '../../tokens/global.tokens';

export const root = style({
  position: 'absolute',
  left: '24px',
  bottom: '24px',
  width: '64px',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  ...borders.radii({ radius: mPercent(50) }),
  ...backgrounds({
    color: colorVars.white.alpha(0.95).css(),
  }),
  ...boxShadow(),
  color: colorVars.svgColor.css(),
  textDecoration: 'none',
  zIndex: 2,
});

export const icon = style({
  width: '24px',
  height: '24px',
});
