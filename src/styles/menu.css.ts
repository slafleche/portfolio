import { style } from '@vanilla-extract/css';

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
  selectors: { '&:hover': { textDecoration: 'underline' } },
});
