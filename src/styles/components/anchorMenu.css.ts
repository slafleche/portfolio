import { style } from '@vanilla-extract/css';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { margins } from '../helpers/spacing.helper';
import borders from '../helpers/borders.helper';

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100%',
  gap: anchorMenuVars.innerGap.css(),
  ...margins(anchorMenuVars.margins),
});

export const item = style({
  width: anchorMenuVars.size.css(),
  height: anchorMenuVars.size.css(),
});

export const link = style({
  width: '100%',
  height: '100%',
  // ...borders(anchorMenuVars.borders),
});
