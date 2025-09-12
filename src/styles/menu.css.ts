import { style } from '@vanilla-extract/css';

export const menu = style({
  display: 'flex',
});

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
  // fill: 'white',
  // filter: 'drop-shadow( 0px 10px 2px rgba(0, 0, 0, .7))',
});

export const logoLink = style({});

export const headerNav = style({});
export const headerNavItem = style({});
