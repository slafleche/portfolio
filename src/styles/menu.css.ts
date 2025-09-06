import { style } from '@vanilla-extract/css';

export const header = style({
  display: 'flex',
});

export const headerBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  maxWidth: '960px',
  margin: '0 auto',
  padding: '1rem',
});

export const nav = style({
  display: 'flex',
  gap: '0.75rem',
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

export const bridge = style({
  filter: 'drop-shadow( 0px 10px 2px rgba(0, 0, 0, .7))',
});

export const logo = style({
  fill: 'white',
  filter: 'drop-shadow( 0px 10px 2px rgba(0, 0, 0, .7))',
});
