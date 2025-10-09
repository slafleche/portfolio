import { style, globalStyle, keyframes } from '@vanilla-extract/css';
import { fullSizeOfParent } from '../helpers/positioning';
import { noiseBg } from '../helpers/noiseSVG';
import { colorVars, themeColours, fontVars } from '../vars';
import transforms from '../helpers/transforms';
import { m } from '../helpers/measurement';
import { margins, paddings } from '../helpers/spacing';
import { fontCSSFrom } from '../helpers/typography';

/* ========== root layout ========== */

export const root = style({
	display: 'flex',
	alignItems: 'center',
	position: 'relative',
	minHeight: '100vh',
	overflow: 'hidden',
	isolation: 'isolate',
});

/* ========== media layers ========== */

export const image = style({
	...fullSizeOfParent(),
	zIndex: 0,
	pointerEvents: 'none',
});

globalStyle(`.${image} img`, {
	display: 'block',
	width: '100%',
	height: '100%',
	objectFit: 'cover',
});

export const video = style({
	...fullSizeOfParent(),
	zIndex: 0,
	inset: 0,
	pointerEvents: 'none',
	objectFit: 'cover',
});

/* === overlays (sit above video, below content) === */

export const overlays = style({
	...fullSizeOfParent(),
	zIndex: 1,
	pointerEvents: 'none',
	position: 'absolute',
	inset: 0,
});

/** Very subtle static grain to break banding */
export const grain = style({
	...fullSizeOfParent(),
	...noiseBg({ opacity: 0.25 }),
});

/** A faint multi-stop wash to even very flat backgrounds */
const washTop = colorVars.shadow.alpha(0.3).css();
const washMid = colorVars.white.alpha(0.1).css();
const washBot = colorVars.black.alpha(0.6).css();

export const wash = style({
	...fullSizeOfParent(),
	backgroundImage: `linear-gradient(180deg, ${washTop} 0%, ${washMid} 45%, ${washBot} 100%)`,
	mixBlendMode: 'soft-light',
	opacity: 0.5,
});

/** Soften center area so the circular band doesn’t pop */
export const centerSoften = style({
	...fullSizeOfParent(),
	backgroundImage: `radial-gradient(
    140% 100% at 50% 0%,
    ${colorVars.shadow.alpha(1).css()} 0%,
    ${colorVars.shadow.alpha(0.15).css()} 42%,
    ${colorVars.shadow.alpha(0).css()} 70%
  )`,
});

/** Break the donut/ring radius with a soft band so it stops catching the eye */
export const ringBreaker = style({
	...fullSizeOfParent(),
	backgroundImage: `radial-gradient(
    68% 52% at 50% 60%,
    transparent 0%,
    ${colorVars.black.alpha(0.028).css()} 52%,
    ${colorVars.black.alpha(0.05).css()} 68%,
    ${colorVars.black.alpha(0).css()} 86%
  )`,
});

/* ========== content ========== */

export const content = style({
	position: 'relative',
	zIndex: 2,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
});

export const paragraph = style({
	textAlign: 'center',
});

/* ========== panel / venn layout ========== */

// Do not export
const offset = m(50);

export const vennContainer = style({
	position: 'relative',
	...paddings({ all: offset.css() }),
	...margins({ all: offset.css() }),
});

export const panelA = style({
	position: 'relative',
	width: '100%',
	transform: transforms.value(transforms.translate(offset, offset.negation())),
});

export const panelB = style({
	transform: transforms.value(
		transforms.translate(offset.negation().double(), offset.double()),
	),
});

export const vennContents = style({
	transform: transforms.value(transforms.translate(offset, offset.negation())),
});

export const vennMiddle = style({
	padding: offset.double().css(),
});

export const panel = style({
	position: 'relative',
	width: 'fit-content',
	maxWidth: '100%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	alignSelf: 'center',
	margin: '0 auto',
});

export const panelContents = style({
	padding: offset.divide(2).css(),
});

export const title_break = style({});

/* ========== animated heading (two spans with data-position) ========== */

const driftLeft = keyframes({
	'0%': { backgroundPosition: '40% 50%' },
	'50%': { backgroundPosition: '60% 50%' },
	'100%': { backgroundPosition: '40% 50%' },
});

const driftRight = keyframes({
	'0%': { backgroundPosition: '60% 50%' },
	'50%': { backgroundPosition: '40% 50%' },
	'100%': { backgroundPosition: '60% 50%' },
});

const mergePulse = keyframes({
	'0%': { transform: 'translate(-50%, -50%) scale(0.98)', opacity: 0.16 },
	'50%': { transform: 'translate(-50%, -50%) scale(1.04)', opacity: 0.22 },
	'100%': { transform: 'translate(-50%, -50%) scale(0.98)', opacity: 0.16 },
});

export const heading = style({
	position: 'relative',
	margin: 0,
	textAlign: 'center',
	...fontCSSFrom(fontVars.hero),
	lineHeight: 1.08,
	// Additional responsive clamp if desired
	fontSize: 'clamp(32px, 7vw, 80px)',
	selectors: {
		'&::after': {
			content: '',
			position: 'absolute',
			left: '50%',
			top: '50%',
			transform: 'translate(-50%, -50%)',
			width: 'min(60%, 28rem)',
			height: '52px',
			filter: 'blur(24px)',
			background:
				'radial-gradient(45% 70% at 50% 50%, rgba(255,255,255,0.22), rgba(255,255,255,0) 65%)',
			pointerEvents: 'none',
			zIndex: 0,
			animation: `${mergePulse} 11s ease-in-out infinite`,
			'@media': {
				'(prefers-reduced-motion: reduce)': {
					animation: 'none',
				},
			},
		},
	},
});

/** Base line style; branch with data-position for variants */
export const line = style({
	display: 'inline-block',
	position: 'relative',
	zIndex: 1,
	WebkitTextFillColor: 'transparent',
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',
	backgroundRepeat: 'no-repeat',
	backgroundSize: '200% 100%',
	backgroundPosition: '50% 50%',
	willChange: 'background-position',
	textShadow: `
    0 1px 0 rgba(0,0,0,0.25),
    0 6px 24px rgba(0,0,0,0.24)
  `,
	selectors: {
		'&[data-position="first"]': {
			fontVariationSettings: '"wght" 720',
			backgroundImage: `linear-gradient(to right, ${themeColours.contrast_a.css()}, ${themeColours.darker.css()} 55%)`,
			animation: `${driftLeft} 24s ease-in-out infinite`,
			'@media': {
				'(prefers-reduced-motion: reduce)': {
					animation: 'none',
				},
			},
		},
		'&[data-position="last"]': {
			fontVariationSettings: '"wght" 660',
			backgroundImage: `linear-gradient(to left, ${themeColours.contrast_b.css()}, ${themeColours.darker.css()} 45%)`,
			marginTop: '-0.08em',
			animation: `${driftRight} 24s ease-in-out infinite`,
			'@media': {
				'(prefers-reduced-motion: reduce)': {
					animation: 'none',
				},
			},
		},
	},
});
