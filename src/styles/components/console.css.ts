import { style } from '@vanilla-extract/css';
import { colorVars, consoleVars } from '../componentTokens/global.componentTokens';
import { m } from '../measurementKit';
import { paddings } from '../helpers/spacing';
import { globalBoxShadow } from '../helpers/shadow';

const consoleFontStack = `"JetBrains Mono", "Fira Code", "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", monospace`;

export const root = style({
	display: 'flex',
	flexDirection: 'column',
	minWidth: '100%',
	minHeight: '475px',
	borderRadius: consoleVars.borders.radius.css(),
	border: `1px solid ${colorVars.white.alpha(0.12).css()}`,
	background: `linear-gradient(160deg, ${colorVars.black.alpha(0.85).css()} 0%, ${colorVars.contrast.alpha(0.22).css()} 100%)`,
	// boxShadow: `0 ${m(10).css()} ${m(30).css()} ${colorVars.black.alpha(0.45).css()}`,
	boxShadow: globalBoxShadow(),
	overflow: 'hidden',
	color: colorVars.white.alpha(0.86).css(),
});

export const header = style({
	display: 'flex',
	alignItems: 'center',
	gap: m(6).css(),
	...paddings({
		vertical: m(10).css(),
		horizontal: m(16).css(),
	}),
	background: colorVars.black.alpha(0.6).css(),
	borderBottom: `1px solid ${colorVars.white.alpha(0.06).css()}`,
});

export const windowDot = style({
	width: m(10).css(),
	height: m(10).css(),
	borderRadius: '50%',
	backgroundColor: '#ff5f56',
	selectors: {
		'&[data-variant="warn"]': {
			backgroundColor: '#ffbd2e',
		},
		'&[data-variant="success"]': {
			backgroundColor: '#27c93f',
		},
	},
});

export const title = style({
	marginLeft: 'auto',
	fontSize: m(14).css(),
	fontFamily: consoleFontStack,
	color: colorVars.white.alpha(0.5).css(),
});

export const body = style({
	display: 'flex',
	flexDirection: 'column',
	gap: m(6).css(),
	fontFamily: consoleFontStack,
	fontSize: m(16).css(),
	lineHeight: 1.6,
	flexGrow: 1,
	...paddings({ all: m(18).css() }),
	backgroundColor: colorVars.black.mix(colorVars.white, 0.005).css(),
	justifyContent: 'flex-end',
	overflowY: 'auto',
});

export const line = style({
	display: 'grid',
	gridTemplateColumns: 'auto 1fr',
	gap: m(12).css(),
	alignItems: 'baseline',
	color: colorVars.white.alpha(0.4).css(),
});

export const lineNumber = style({
	color: colorVars.white.alpha(0.35).css(),
	textAlign: 'right',
});

export const code = style({
	whiteSpace: 'pre',
});

export const accent = style({
	color: colorVars.contrast.alpha(0.45).css(),
});

export const comment = style({
	color: colorVars.white.alpha(0.3).css(),
	fontStyle: 'italic',
});
