import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'grid',
  gridTemplateColumns:
    'repeat(var(--grid-columns, 1), minmax(0, 1fr))',
  gap: '6px',
});

export const column = style({
  gridColumn: 'span var(--grid-span, 1)',
  display: 'flex',
  flexDirection: 'column',
});
