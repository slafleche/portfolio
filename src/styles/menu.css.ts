import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import {
	absolutePosition,
	flexMiddle,
	flexPosition,
} from './helpers/positioning';
import {
	archVars,
	colors,
	colorVars,
	dropShadowVars,
	fontFamilies,
	logoVars,
	menuVars,
} from './vars';
import { fontWeightStyle } from './helpers/typography';
import { paddings } from './helpers/spacing';

export const menu = style({
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	zIndex: 100,
	transform: `translate3d(0, -${
		(archVars.top.value +
			archVars.curveHeight.value +
			dropShadowVars.offsetY.value +
			dropShadowVars.blur.value) *
		1.5
	}px, 0)`,
	transition: 'transform 0.8s cubic-bezier(0.69, 0.42, 0.01, 1) 0.3s',
	willChange: 'transform',
	backfaceVisibility: 'hidden',

	selectors: {
		'&[data-mounted="true"]': {
			transform: 'translate3d(0, 0, 0)',
		},
	},
});

export const contents = style({
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'nowrap',
	width: '100%',
	height: '100%',
	position: 'relative',
	zIndex: 1,
});
export const nav = style({
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'nowrap',
	width: '100%',
	height: archVars.top.css(),
	...absolutePosition.topLeft(),
	position: 'absolute',
});

export const highlightLayer = style({
	position: 'absolute',
	inset: 0,
	pointerEvents: 'none',
	zIndex: 0,
});

export const miniBokeh = style({
	position: 'absolute',
	borderRadius: '999px',
	background: (() => {
		const gradients = menuVars.hover.blobs.map(
			({ color, posX, posY, radius, intensity }) => {
				const chromaColor = color ?? colorVars.contrast;
				const solid = chromaColor.alpha(intensity ?? 0.3).css();
				const soft = chromaColor.alpha(0).css();
				return `radial-gradient(circle at ${posX}% ${posY}%, ${solid} 0%, ${soft} ${radius}%)`;
			},
		);
		return gradients.join(', ');
	})(),
	filter: `blur(${menuVars.hover.blur.value}px)`,
	boxShadow: `0 0 ${menuVars.hover.shadow.spread.value}px ${colorVars.contrast.alpha(menuVars.hover.shadow.opacity).css()}`,
	opacity: 0,
	transform: 'translate3d(0, 0, 0)',
	transition:
		'opacity 180ms ease, transform 450ms cubic-bezier(0.4, 0, 0.2, 1), width 350ms ease, height 350ms ease',
	mixBlendMode: 'screen',
});

const focusScale = logoVars.focus?.scale ?? 1.05;
const focusTransition = logoVars.focus?.transitionMs ?? 260;

type LogoHoverBlobConfig = {
	color?: typeof colorVars.contrast;
	posX?: number;
	posY?: number;
	radius?: number;
	intensity?: number;
};

type LogoHoverConfig = typeof logoVars.hover & {
	blobs?: LogoHoverBlobConfig[];
	squareSizeMultiplier?: number;
	squareBlur?: number;
	squareOpacity?: number;
	durationMs?: number;
	speedMultiplier?: number;
};

const logoHoverConfig = (logoVars.hover ?? {}) as LogoHoverConfig;
const logoHoverGradientsList = (logoHoverConfig.blobs ?? []).map(
	(blob): string => {
		const { color, posX, posY, radius, intensity } = blob;
		const chromaColor = color ?? colorVars.contrast;
		const solid = chromaColor.alpha(intensity ?? 0.35).css();
		const soft = chromaColor.alpha(0).css();
		const x = posX ?? 50;
		const y = posY ?? 50;
		const r = radius ?? 48;
		return `radial-gradient(circle at ${x}% ${y}%, ${solid} 0%, ${soft} ${r}%)`;
	},
);
const logoHoverGradients =
	logoHoverGradientsList.length > 0
		? logoHoverGradientsList.join(', ')
		: `radial-gradient(circle at 50% 50%, ${colorVars.contrast
				.alpha(0.35)
				.css()} 0%, ${colorVars.contrast.alpha(0).css()} 60%)`;
const logoHoverSizeMultiplier = logoHoverConfig.squareSizeMultiplier ?? 2.4;
const logoHoverSizePercent = `${logoHoverSizeMultiplier * 100}%`;
const logoHoverBlur = logoHoverConfig.squareBlur ?? 18;
const logoHoverOpacity = logoHoverConfig.squareOpacity ?? 1;

const logoHoverBaseDuration = logoHoverConfig.durationMs ?? 20000;
const logoHoverSpeedMultiplier = logoHoverConfig.speedMultiplier ?? 1;
const logoHoverDuration =
	logoHoverSpeedMultiplier <= 0
		? logoHoverBaseDuration
		: logoHoverBaseDuration / logoHoverSpeedMultiplier;

const logoHoverOutline = logoVars.hover?.outline;
const logoHoverOutlineWidth = logoHoverOutline?.width.css() ?? '2px';
const logoHoverOutlineOffset = logoHoverOutline?.offset.css() ?? '6px';
const logoHoverOutlineColor = (
	logoHoverOutline?.color ?? colorVars.contrast.alpha(0.6)
).css();

const logoOrbit = keyframes({
	'0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
	'100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
});

const logoHoverRotate = keyframes({
	'0%': { transform: 'rotate(0deg) scale(1)' },
	'20%': { transform: 'rotate(-16deg) scale(0.9)' },
	'40%': { transform: 'rotate(-16deg) scale(0.9)' },
	'55%': { transform: `rotate(138deg) scale(${focusScale * 1.015})` },
	'85%': { transform: `rotate(118deg) scale(${focusScale * 0.992})` },
	'100%': { transform: `rotate(120deg) scale(${focusScale})` },
});

const logoHoverExitDuration = 560;

const logoHoverRotateReverse = keyframes({
	'0%': { transform: `rotate(120deg) scale(${focusScale})` },
	'40%': { transform: `rotate(130deg) scale(${focusScale * 1.05})` },
	'74%': { transform: 'rotate(-10deg) scale(0.985)' },
	'100%': { transform: 'rotate(0deg) scale(1)' },
});

export const debugArch = style({
	position: 'absolute',
	left: 0,
	top: 0,
	width: '100%',
	height: '100%',
	fill: 'none',
	pointerEvents: 'none',
});

// One side
export const list = style({
	position: 'relative',
	display: 'flex',
	alignItems: 'center',
	flexWrap: 'nowrap',
	flexGrow: '1',
	width: '50%',
	top: menuVars.verticalOffset.css(),
	selectors: {
		'&[data-side="left"]': {
			justifyContent: 'flex-end',
			order: 0,
			paddingRight: logoVars.width.css(),
			transformOrigin: 'right center',
		},

		'&[data-side="right"]': {
			justifyContent: 'flex-start',
			order: 1,
			paddingLeft: logoVars.width.css(),
			transformOrigin: 'left center',
		},
	},
});

export const item = style({
	// flex: '0 0 auto',
	// whiteSpace: 'nowrap',
	// display: 'flex',
	// alignItems: 'center',
});

// Intentionally reorder so the logo is the first item visually but not in DOM
export const item_1 = style({
	// order: 0,
});
export const item_2 = style({
	// order: 0,
});

// Logo in the middle
export const logoItem = style({
	position: 'absolute',
	zIndex: 1,
	top: archVars.top.half().add(logoVars.offsetY.value).css(),
	left: '50%',
	...flexMiddle(),
	transform: 'translate(-50%, -50%)',
	width: logoVars.width.css(),
	height: logoVars.width.css(),
});

export const logoLink = style({
	...flexPosition.center(),
	width: logoVars.width.css(),
	height: logoVars.width.css(),
	position: 'relative',
	selectors: {
		'&::before': {
			content: '',
			position: 'absolute',
			left: '50%',
			top: '50%',
			width: logoHoverSizePercent,
			height: logoHoverSizePercent,
			transform: 'translate(-50%, -50%) rotate(0deg)',
			transformOrigin: '50% 50%',
			borderRadius: '50%',
			backgroundImage: logoHoverGradients,
			backgroundRepeat: 'no-repeat',
			backgroundSize: '100% 100%',
			mixBlendMode: 'screen',
			filter: `blur(${logoHoverBlur}px)`,
			opacity: 0,
			animation: `${logoOrbit} ${logoHoverDuration}ms linear infinite`,
			animationPlayState: 'paused',
			willChange: 'transform',
			pointerEvents: 'none',
			transition: `opacity ${focusTransition}ms ease`,
			zIndex: 0,
		},
		'&[data-logo-anim="enter"]::before': {
			opacity: logoHoverOpacity,
			animationPlayState: 'running',
		},
		'&[data-logo-anim="exit"]::before': {
			opacity: 0,
			animationPlayState: 'paused',
			animation: 'none',
			transform: 'translate(-50%, -50%) rotate(0deg)',
		},
		'&:focus-visible::before': {
			opacity: 1,
			backgroundImage: 'none',
			filter: 'none',
			mixBlendMode: 'normal',
			border: `${logoHoverOutlineWidth} solid ${logoHoverOutlineColor}`,
			boxSizing: 'border-box',
			width: `calc(100% + ${logoHoverOutlineOffset} * 2)`,
			height: `calc(100% + ${logoHoverOutlineOffset} * 2)`,
			animation: 'none',
		},
	},
});

export const item_3 = style({
	order: 2,
});

export const item_4 = style({
	order: 2,
});

export const headerNavItem = style({
	...absolutePosition.topRight(),
	order: 5,
});

export const link = style({
	textDecoration: 'none',
	borderRadius: 8,
	...paddings({ vertical: '0.25rem', horizontal: '0.5rem' }),
});

export const logo = style({
	width: logoVars.width.css(),
	height: 'auto',
	position: 'relative',
	zIndex: 1,
	transform: 'rotate(0deg) scale(1)',
	transformOrigin: 'center',
	transformBox: 'fill-box',
	transition: `transform ${focusTransition}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
	willChange: 'transform',
	selectors: {
		'[data-logo-anim="enter"] &': {
			animation: `${logoHoverRotate} 780ms cubic-bezier(0.5, 1.55, 0.35, 1) forwards`,
		},
		'[data-logo-anim="exit"] &': {
			animation: `${logoHoverRotateReverse} ${logoHoverExitDuration}ms cubic-bezier(0.45, 0, 0.2, 1) forwards`,
		},
		[`${logoLink}:focus-visible &`]: {
			animation: 'none',
			transform: `rotate(0deg) scale(${focusScale})`,
		},
	},
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			selectors: {
				'[data-logo-anim="enter"] &': {
					animation: 'none',
					transform: `rotate(0deg) scale(${focusScale})`,
				},
				'[data-logo-anim="exit"] &': {
					animation: 'none',
					transform: 'rotate(0deg) scale(1)',
				},
			},
		},
	},
});

export const localeChanger = style({
	...absolutePosition.topRight(),
});

const menuFont = fontFamilies.baloo;
// used to calculate the position of the underline and the vertical offset to center it
// const linkOffset =

export const navLink = style({
	position: 'relative',
	display: 'block',
	...paddings(menuVars.padding),
	// transform: 'translateY(-50%)',
	// fontSize: fontVars.menu.size.css(),
	fontFamily: menuFont.family,
	...fontWeightStyle(menuFont, 50),
	fontSize: '16px',
	lineHeight: 1,
	textDecoration: 'none',
	letterSpacing: '0.05rem',
	borderRadius: '50%',
	color: colors.navFg.css(),
	// textShadow: `1px 1.2px 1.2px ${colorVars.black.alpha(0.45).css()}`,
	// backgroundColor: colorVars.navFg.alpha(0.045).css(),
	// backdropFilter: `blur(10px)`,
	// ...border({
	// 	width: m(1),
	// 	color: colorVars.navFg.alpha(0.1).css(),
	// }),
	// textShadow: `0px -0.5px 0px ${colorVars.white.alpha(0.4).css()},
	// 	0px 1.2px 1.2px ${colorVars.black.alpha(0.45).css()}`,
	// backgroundClip: 'text',
	// WebkitBackgroundClip: 'text',
	// WebkitTextFillColor: 'transparent',

	// filter:	'drop-shadow(0 1px 0 rgba(255,255,255,0.15)) drop-shadow(0 1px 2px rgba(0,0,0,0.35))',
	transition: 'all 0.45s ease',
	textShadow: `2px 2px 3px ${colorVars.navBg.css()}`,
	backgroundRepeat: 'no-repeat',
	backgroundSize: '100% 1.5px',
	textTransform: 'uppercase',

	// backgroundImage: `
	// linear-gradient(${chroma.mix(colorVars.navFg, colorVars.navBg, 0.75).css()} 0 0),
	// linear-gradient(${chroma.mix(colorVars.navFg, colorVars.navBg, 0.5).css()} 0 0)
	// `,
	backgroundPosition: `left 200% bottom 0, left 200% bottom 0.3em`,

	selectors: {
		'&:hover': {
			// textDecoration: 'underline',
		},
		// '&[data-active="true"]': { background: 'rgba(0,0,0,0.06)' }, // state via data-attr
		'&[data-active="true"]': {
			// color: colorVars.contrast.css(),
			// transform: 'scale(1.2)',
			// letterSpacing: '0.1rem',
		},
		'&[aria-current="true"]': {
			pointerEvents: 'auto',
			cursor: 'pointer',
		},
		'&:visited': {
			color: colors.navFg.css(),
		},
		'&[data-ui]:focus-visible': {
			outline: '2px solid currentColor',
			outlineOffset: 2,
			// color: navLinkColor,
			// outline: '2px solid currentColor', outlineOffset: 2
			// color: colorVars.transparent.css(),
		},
	},
});

// For hover effects. we already have 2 inline transform styles on the link, this makes it easier to write the other in CSS
export const text = style({});
globalStyle(`.${navLink}[data-side="left"]:hover ${text}`, {
	transform: `translate(-5px, -5px) scale(1.1)`,
});
globalStyle(`.${navLink}[data-side="right"]:hover ${text}`, {
	transform: `translate(5px, 5px) scale(1.1)`,
});

// For subtle rotation on links
globalStyle(`.${list}[data-side="left"] .${navLink}`, {
	transformOrigin: 'right center',
});
globalStyle(`.${list}[data-side="right"] .${navLink}`, {
	transformOrigin: 'left center',
});
