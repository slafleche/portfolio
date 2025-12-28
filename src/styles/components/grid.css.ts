import { style } from '@vanilla-extract/css';
import { gridLayoutVars } from '../../tokens/layout.tokens';

export const root = style({
  display: 'grid',
  alignItems: 'stretch',
  gap: gridLayoutVars.gap.css(),
});

export const column = style({
  display: 'flex',
  flexDirection: 'column',
});

export const fillRow = style({
  height: '100%',
});
