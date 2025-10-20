import { style } from '@vanilla-extract/css';
import { m } from '@/styles/helpers/measurement';

export const root = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(var(--grid-columns, 1), minmax(0, 1fr))',
	gap: m(6).css(),
});

export const column = style({
	gridColumn: 'span var(--grid-span, 1)',
	display: 'flex',
	flexDirection: 'column',
});
