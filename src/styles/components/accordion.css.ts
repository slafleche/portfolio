import { style } from '@vanilla-extract/css';
import { m } from '@/styles/helpers/measurement';
import { colorVars } from '@/styles/vars';

export const root = style({
	display: 'flex',
	flexDirection: 'column',
	gap: m(2).css(),
});

export const item = style({
	borderRadius: m(2).css(),
	border: `${m(0.25).css()} solid ${colorVars.border.css()}`,
	backgroundColor: colorVars.bodyBg.css(),
	boxShadow: `0 ${m(1).css()} ${m(3).css()} rgba(0,0,0,0.08)`,
	overflow: 'hidden',
});

export const trigger = style({
	appearance: 'none',
	background: 'transparent',
	border: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	width: '100%',
	padding: `${m(3).css()} ${m(4).css()}`,
	font: 'inherit',
	color: 'inherit',
	cursor: 'pointer',
	textAlign: 'left',
	transition: 'background-color 160ms ease-in-out',
	selectors: {
		'&:hover, &:focus-visible': {
			backgroundColor: colorVars.border.css(),
			outline: 'none',
		},
	},
});

export const triggerLabel = style({
	flex: 1,
	fontWeight: 600,
});

export const triggerSubtitle = style({
	display: 'block',
	marginTop: m(1).css(),
	fontSize: '0.875rem',
	color: colorVars.bodyFg.css(),
	opacity: 0.7,
});

export const icon = style({
	marginLeft: m(2).css(),
	transition: 'transform 180ms ease-in-out',
});

export const iconOpen = style({
	transform: 'rotate(180deg)',
});

export const iconSvg = style({
	display: 'block',
	width: m(3).css(),
	height: 'auto',
});

export const panel = style({
	overflow: 'hidden',
	transition: 'max-height 220ms ease, opacity 200ms ease',
	maxHeight: '0px',
	opacity: 0,
});

export const panelOpen = style({
	opacity: 1,
});

export const panelInner = style({
	padding: `${m(2).css()} ${m(4).css()} ${m(4).css()}`,
	color: colorVars.bodyFg.css(),
	opacity: 0.85,
});
