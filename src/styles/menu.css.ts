import { style } from '@vanilla-extract/css';
import { colorVars } from './vars.css';

export const menu = style({
  display: 'flex',
  backgroundColor: colorVars.navBg.css(),
});

export const headerNav = style({});

export const nav = style({
  display: 'flex',
  alignItems: 'center',
});

export const list = style({
  display: 'flex',
  alignItems: 'center',
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
});

// Intentionally reorder so the logo is the first item visually but not in DOM
export const logoItem = style({
  order: 3,
});
export const item_1 = style({
  order: 1,
});
export const item_2 = style({
  order: 2,
});
export const item_3 = style({
  order: 3,
});
export const item_4 = style({
  order: 4,
});

export const link = style({
  textDecoration: 'none',
  fontWeight: 600,
  borderRadius: 8,
  padding: '0.25rem 0.5rem',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
    '&[data-active="true"]': { background: 'rgba(0,0,0,0.06)' }, // state via data-attr
    '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 },
  },
});

export const logo = style({
  width: '60px',
  height: 'auto',
  // filter: 'drop-shadow( 0px 10px 2px rgba(0, 0, 0, .7))',
});

export const logoLink = style({});

export const headerNavItem = style({
  order: 5,
});
