import { style } from '@vanilla-extract/css';
import { colorVars } from '../../tokens/global.tokens';;

export const link = style({
  position: 'fixed',
  left: '50%',
  transform: 'translate(-50%, -200%)',
  top: '2px',
  backgroundColor: colorVars.bodyBg.css(),
  color: colorVars.bodyFg.css(),
  padding: '2px 4px',
  borderRadius: '2px',
  textDecoration: 'none',
  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
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
