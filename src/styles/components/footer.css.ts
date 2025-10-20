import { style } from '@vanilla-extract/css';
import { m } from '@/styles/helpers/measurement';
import { colorVars, fontVars } from '@/styles/vars';

export const root = style({
	marginTop: m(20).css(),
	padding: `${m(12).css()} ${m(6).css()}`,
	backgroundColor: colorVars.navBg.alpha(0.3).css(),
	backdropFilter: 'blur(12px)',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	rowGap: m(4).css(),
	color: colorVars.bodyFg.css(),
	width: '100%',
	borderTop: `${m(0.5).css()} solid ${colorVars.border.css()}`,
});

export const heading = style({
	fontFamily: fontVars.hero.family,
	fontWeight: 700,
	fontSize: m(24).css(),
	margin: 0,
});

export const content = style({
	textAlign: 'center',
	maxWidth: m(240).css(),
	margin: 0,
	opacity: 0.85,
});

export const links = style({
	textAlign: 'center',
	margin: 0,
});
