import { keyframes, style } from '@vanilla-extract/css';
import { m } from '@/styles/helpers/measurement';
import { colorVars, themeColours } from '../vars';
import { paddings } from '../helpers/spacing';
import { globalBoxShadow } from '../helpers/shadow';
import { focusOutline } from '../helpers/focusOutline';

const offset = m(26);
const buttonSize = m(66);
const iconSize = m(36);
const iconOffsetX = iconSize.divide(10).round();
const iconOffsetY = iconSize.divide(10).round();

const translate = (x: string, y: string) => `translate(${x}, ${y})`;

const originTranslate = translate('0%', '0%');
const hiddenTranslate = translate('-60%', '160%');
const entryOvershootTranslate = translate('14%', '-9%');
const exitHoldTranslate = translate('0%', '0%');
const exitOvershootTranslate = translate('9%', '-6%');

const entryDurationMs = 520;
const exitDurationMs = 540;
const iconFlipDurationMs = 2000;

export const wrapper = style({
	position: 'fixed',
	left: 0,
	bottom: 0,
	width: buttonSize.multiply(3.6).css(),
	height: buttonSize.multiply(3.6).css(),
	zIndex: 30,
	overflow: 'hidden',
	pointerEvents: 'none',
	selectors: {
		'&[data-state="visible"]': {
			pointerEvents: 'auto',
		},
	},
});

export const root = style({
	position: 'absolute',
	width: buttonSize.css(),
	height: buttonSize.css(),
	left: offset.css(),
	bottom: offset.css(),
	borderRadius: '50%',
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: colorVars.white.alpha(0.95).css(),
	color: colorVars.navBg.css(),
	textDecoration: 'none',
	boxShadow: globalBoxShadow(),
	pointerEvents: 'none',
	transform: hiddenTranslate,
	transition: 'box-shadow 220ms ease',
	willChange: 'transform',
	// willChange: 'transform, opacity',
	selectors: {
		'&:hover, &:focus-visible': {
			boxShadow: globalBoxShadow({ blur: m(12) }),
		},
		'&:focus-visible': focusOutline({
			color: themeColours.lights.b
				.mix(themeColours.lights.d, 0.5)
				.css(),
			width: m(3),
			offset: m(4),
		}),
	},
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			transition: [
				'transform 160ms ease',
				'box-shadow 160ms ease',
			].join(', '),
		},
	},
});

const enterBounce = keyframes({
	'0%': {
		transform: hiddenTranslate,
	},
	'70%': {
		transform: entryOvershootTranslate,
	},
	'100%': {
		transform: originTranslate,
	},
});

const exitBounce = keyframes({
	'0%': {
		transform: originTranslate,
	},
	'65%': {
		transform: exitHoldTranslate,
	},
	'82%': {
		transform: exitOvershootTranslate,
	},
	'100%': {
		transform: hiddenTranslate,
	},
});

export const gradient = style({
	position: 'absolute',
	inset: 0,
	borderRadius: '50%',
	backgroundImage: `linear-gradient(135deg, ${themeColours.lights.b.css()} 0%, ${themeColours.lights.d.css()} 100%)`,
	opacity: 0,
	transition: 'opacity 200ms ease',
	zIndex: 0,
	pointerEvents: 'none',
});

export const visible = style({
	opacity: 1,
	pointerEvents: 'auto',
	transform: originTranslate,
	animation: `${enterBounce} ${entryDurationMs}ms cubic-bezier(0.24, 1.46, 0.38, 1) forwards`,
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			animation: 'none',
		},
	},
});

export const leaving = style({
	pointerEvents: 'none',
	animation: `${exitBounce} ${exitDurationMs}ms cubic-bezier(0.24, 1.2, 0.4, 1) forwards`,
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			animation: 'none',
		},
	},
});

const iconFlip = keyframes({
	'0%': {
		transform: 'rotate(0deg)',
	},
	'40%': {
		transform: 'rotate(12deg)',
	},
	'72%': {
		transform: 'rotate(-176deg)',
	},
	'84%': {
		transform: 'rotate(-182deg)',
	},
	'100%': {
		transform: 'rotate(-180deg)',
	},
});

export const icon = style({
	position: 'relative',
	zIndex: 1,
	...paddings({
		top: iconOffsetY,
		right: iconOffsetX,
	}),
	width: iconSize.css(),
	height: iconSize.css(),
	transform: 'rotate(0deg)',
	transformOrigin: '50% 50%',
	transition: 'color 200ms ease, transform 200ms ease',
});

export const iconVisible = style({
	selectors: {
		[`${root}:hover &`]: {
			color: colorVars.white.css(),
		},
		[`${root}:focus-visible &`]: {
			color: colorVars.white.css(),
		},
	},
});

export const gradientVisible = style({
	selectors: {
		[`${root}:hover &`]: {
			opacity: 1,
		},
		[`${root}:focus-visible &`]: {
			opacity: 1,
		},
	},
});

export const iconLeaving = style({
	animation: `${iconFlip} ${iconFlipDurationMs}ms cubic-bezier(0.45, 1.45, 0.25, 1) forwards`,
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			animation: 'none',
		},
	},
});
