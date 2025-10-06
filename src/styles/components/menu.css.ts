import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { absolutePosition, flexPosition } from '../helpers/positioning';
import {
	archVars,
	colors,
	colorVars,
	dropShadowVars,
	fontFamilies,
	fontVars,
	logoVars,
	menuVars,
} from '../vars';
import { fontWeightStyle } from '../helpers/typography';
import { paddings } from '../helpers/spacing';
import { m } from '../helpers/measurement';
import transforms from '../helpers/transforms';

export const root = style({
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	zIndex: 100,
	transform: transforms.value(
		transforms.translate3d(
			0,
			-(
				archVars.top.value +
				archVars.curveHeight.value +
				dropShadowVars.offsetY.value +
				dropShadowVars.blur.value
			) * 1.5,
			0,
		),
	),
	transition: 'transform 0.8s cubic-bezier(0.69, 0.42, 0.01, 1) 0.3s',
	willChange: 'transform',
	backfaceVisibility: 'hidden',

	selectors: {
		'&[data-mounted="true"]': {
			transform: transforms.value(transforms.translate3d(0, 0, 0)),
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

export const transitionAfterFonts = style({
	opacity: 0,
	transition: 'opacity 360ms ease-out',
});

globalStyle(`.${root}[data-mounted="true"] .${transitionAfterFonts}`, {
	opacity: 1,
});
export const nav = style({
	display: 'flex',
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

export const miniBokehContainer = style({
	position: 'absolute',
	pointerEvents: 'none',
	opacity: 0,
	transition: 'opacity 1.5s ease-out',
	selectors: {
		'&[data-active="true"]': {
			opacity: 1,
		},
	},
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
	opacity: 1,
	transform: transforms.value(transforms.translate3d(0, 0, 0)),
	transition:
		'transform 450ms cubic-bezier(0.4, 0, 0.2, 1), width 350ms ease, height 350ms ease',
	mixBlendMode: 'screen',
});

const focusScale = logoVars.focus?.scale ?? 1.05;
const hoverScale = focusScale * 1.05;
const maxLogoRotationDeg = 130;
const maxLogoRotationRad = (maxLogoRotationDeg * Math.PI) / 180;
const rotationScaleFactor =
	Math.abs(Math.cos(maxLogoRotationRad)) +
	Math.abs(Math.sin(maxLogoRotationRad));
const autoHitboxScale = hoverScale * rotationScaleFactor;
const focusTransition = logoVars.focus?.transitionMs ?? 260;

const logoHoverOutline = logoVars.hover?.outline;
const logoHitboxSize = logoVars.width.multiply(autoHitboxScale);
const hitboxBuffer = m(6);
const logoHitboxDiameter = logoHitboxSize.add(hitboxBuffer.value);
const logoHitboxPadding = logoHitboxDiameter.divide(2);
const navPaddingValue = logoVars.width.value / 2 + 6;
const logoNavPaddingMeasurement = m(
	navPaddingValue,
	logoVars.width.unit ?? 'px',
);
const logoNavPadding = logoNavPaddingMeasurement.css();
const logoHoverOutlineWidth = logoHoverOutline?.width.css() ?? '2px';
const logoHoverOutlineOffset = logoHoverOutline?.offset.css() ?? '6px';
const logoHoverOutlineColor = (
	logoHoverOutline?.color ?? colorVars.contrast.alpha(0.6)
).css();

const logoHoverRotate = keyframes({
	'0%': {
		transform: transforms.value(transforms.rotate(0), transforms.scale(1)),
	},
	'20%': {
		transform: transforms.value(transforms.rotate(-16), transforms.scale(1)),
	},
	'40%': {
		transform: transforms.value(transforms.rotate(-16), transforms.scale(1)),
	},
	'55%': {
		transform: transforms.value(
			transforms.rotate(138),
			transforms.scale(focusScale * 1.015),
		),
	},
	'85%': {
		transform: transforms.value(
			transforms.rotate(118),
			transforms.scale(focusScale * 0.992),
		),
	},
	'100%': {
		transform: transforms.value(
			transforms.rotate(120),
			transforms.scale(focusScale),
		),
	},
});

const logoHoverExitDuration = 560;

const logoHoverRotateReverse = keyframes({
	'0%': {
		transform: transforms.value(
			transforms.rotate(120),
			transforms.scale(focusScale),
		),
	},
	'40%': {
		transform: transforms.value(
			transforms.rotate(130),
			transforms.scale(focusScale * 1.05),
		),
	},
	'74%': {
		transform: transforms.value(transforms.rotate(-10), transforms.scale(1)),
	},
	'100%': {
		transform: transforms.value(transforms.rotate(0), transforms.scale(1)),
	},
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
	// top: menuVars.verticalOffset.css(),
	selectors: {
		'&[data-side="left"]': {
			justifyContent: 'flex-end',
			order: 0,
			...paddings({
				right: logoNavPadding,
				left: logoNavPadding,
			}),
			transformOrigin: 'right center',
		},

		'&[data-side="right"]': {
			justifyContent: 'flex-start',
			order: 1,
			...paddings({
				right: logoNavPadding,
				left: logoNavPadding,
			}),
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
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	top: archVars.top.half().add(logoVars.offsetY.value).css(),
	left: '50%',
	zIndex: 1,
	transform: transforms.value(transforms.translate('-50%', '-50%')),
	width: logoHitboxPadding.multiply(2).css(),
	height: logoHitboxPadding.multiply(2).css(),
});

export const logoLink = style({
	...flexPosition.center(),
	width: '100%',
	height: '100%',
	position: 'relative',
	cursor: 'pointer',
	selectors: {
		'&:focus-visible': {
			outline: `${logoHoverOutlineWidth} solid ${logoHoverOutlineColor}`,
			outlineOffset: logoHoverOutlineOffset,
		},
		'&[data-at-top="true"]': {
			cursor: 'default',
		},
	},
});

export const logoClip = style({
	display: 'flex',
	width: '100%',
	height: '100%',
	justifyContent: 'center',
	alignItems: 'center',
	borderRadius: '50%',
	overflow: 'hidden',
	pointerEvents: 'none',
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
	...paddings({ vertical: '10px', horizontal: '20px' }),
});

export const logoWrap = style({
	width: logoVars.width.css(),
	height: logoVars.width.css(),
	position: 'relative',
	zIndex: 1,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	margin: '0 auto',
	transform: transforms.value(transforms.rotate(0), transforms.scale(1)),
	clipPath: 'circle(50% at 50% 50%)',
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
			transform: transforms.value(
				transforms.rotate(0),
				transforms.scale(focusScale),
			),
		},
	},
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			selectors: {
				'[data-logo-anim="enter"] &': {
					animation: 'none',
					transform: transforms.value(
						transforms.rotate(0),
						transforms.scale(focusScale),
					),
				},
				'[data-logo-anim="exit"] &': {
					animation: 'none',
					transform: transforms.value(
						transforms.rotate(0),
						transforms.scale(1),
					),
				},
			},
		},
	},
});

export const logo = style({
	width: '100%',
	height: '100%',
	display: 'block',
	position: 'relative',
	zIndex: 1,
});

const menuFont = fontFamilies.baloo;
// used to calculate the position of the underline and the vertical offset to center it
// const linkOffset =

export const localeChanger = style({
	...absolutePosition.topRight('50%', menuVars.padding.horizontal.half().css()),
	display: 'flex',
	alignContent: 'center',
	height: '100%',
	fontFamily: menuFont.family,
	fontSize: fontVars.menu.size.css(),
	...fontWeightStyle(menuFont, fontVars.menu.relativeWeight),
	lineHeight: 1,
	textDecoration: 'none',
	zIndex: 1,
	textShadow: `2px 2px 3px ${colorVars.navBg.css()}`,
	transform: transforms.value(
		transforms.skewX(menuVars.skew.multiply(-1.5)),
		transforms.rotate(2),
		transforms.translateY('-50%'),
	),
});

export const localeLink = style({
	position: 'relative',
	top: menuVars.locale.offsetY.css(),
	color: colors.navFg.css(),
	alignSelf: 'center',
	transition: 'opacity 0.2s ease-in',
	opacity: menuVars.locale.opacity,
	display: 'inline-grid',
	gridTemplateAreas: 'stack',
	alignItems: 'center',
	transform: transforms.value(transforms.skewX(menuVars.rotationMax).negate()),
	selectors: {
		'&:hover, &:focus-visible': {
			opacity: 1,
			textShadow: `${menuVars.textShadow.offsetX.css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
		},
		'&:visited': {
			color: colors.navFg.css(),
		},
	},
});

export const navLink = style({
	position: 'relative',
	display: 'inline-grid',
	gridTemplateAreas: 'stack',
	alignItems: 'start',
	verticalAlign: 'baseline',
	...paddings(menuVars.padding),
	// transform: 'translateY(-50%)',
	// fontSize: fontVars.menu.size.css(),
	fontFamily: menuFont.family,
	fontSize: fontVars.menu.size.css(),
	...fontWeightStyle(menuFont, fontVars.menu.relativeWeight),
	lineHeight: 1,
	textDecoration: 'none',
	letterSpacing: '0.5px',
	borderRadius: '50%',
	color: colors.navFg.css(),
	transition: 'all 0.45s ease',
	backgroundRepeat: 'no-repeat',
	backgroundSize: '100% 1.5px',
	textTransform: 'uppercase',
	backgroundPosition: `left 200% bottom 0, left 200% bottom 0.3em`,
	transformOrigin: '0 0',
	opacity: 0.7,
	selectors: {
		'&:hover': {
			// textDecoration: 'underline',
			opacity: 1,
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
			opacity: 1,
			// color: navLinkColor,
			// outline: '2px solid currentColor', outlineOffset: 2
			// color: colorVars.transparent.css(),
		},
	},
});

// For hover effects. we already have 2 inline transform styles on the link, this makes it easier to write the other in CSS
export const text = style({
	position: 'relative',
	transition: 'all 0.2s ease-in',
	gridArea: 'stack',
});

export const fakeShadow = style({
	...absolutePosition.topLeft(),
	// Keep transparent, but we'll add mirrored text shadow
	color: colorVars.transparent.css(),
	gridArea: 'stack',
});

globalStyle(`.${navLink}[data-side="left"] .${fakeShadow}`, {
	textShadow: `${menuVars.textShadow.offsetX.css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
});

globalStyle(`.${navLink}[data-side="right"] .${fakeShadow}`, {
	textShadow: `${menuVars.textShadow.offsetX.negation().css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
});

globalStyle(`.${navLink}:hover .${fakeShadow}`, {
	filter: `blur(${menuVars.hover.shadow.blur.css()})`,
});

globalStyle(`.${navLink}[data-side="left"]:hover .${text}`, {
	transform: transforms.value(
		transforms.translate(
			menuVars.hover.text.offsetX.negation(),
			menuVars.hover.text.offsetY,
		),
		transforms.scale(menuVars.hover.text.scale),
	),
});

globalStyle(`.${navLink}[data-side="right"]:hover .${text}`, {
	transform: transforms.value(
		transforms.translate(
			menuVars.hover.text.offsetX,
			menuVars.hover.text.offsetY,
		),
		transforms.scale(menuVars.hover.text.scale),
	),
});

globalStyle(
	`.${localeLink}:hover .${text},
	.${localeLink}:focus-visible .${text}`,
	{
		transform: transforms.value(
			transforms.translate(
				menuVars.hover.text.offsetX,
				menuVars.hover.text.offsetY,
			),
			transforms.scale(menuVars.hover.text.scale),
		),
	},
);

globalStyle(`.${localeLink} .${fakeShadow}`, {
	textShadow: `${menuVars.textShadow.offsetX.negation().css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
});

// For subtle rotation on links
globalStyle(`.${list}[data-side="left"] .${navLink}`, {
	transformOrigin: 'right center',
});
globalStyle(`.${list}[data-side="right"] .${navLink}`, {
	transformOrigin: 'left center',
});
