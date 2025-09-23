import { style } from '@vanilla-extract/css';
// import { colorVars } from '../vars';
import { absolutePosition } from '../helpers/positioning';

export const image = style({
  ...absolutePosition.topLeft(),
  width: '100%',
  height: '100vh',
  //   mixBlendMode: 'multiply',
  overflow: 'hidden',
});
