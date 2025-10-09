import { style, globalStyle, keyframes } from '@vanilla-extract/css';
import chroma from 'chroma-js';
import { fullSizeOfParent } from '../helpers/positioning';
import { noiseBg } from '../helpers/noiseSVG';
import { colorVars, fontVars } from '../vars';
import transforms from '../helpers/transforms';
import { m } from '../helpers/measurement';
import { margins, paddings } from '../helpers/spacing';
import { fontCSSFrom, fontWeightStyle } from '../helpers/typography';

/* ============================================================================
   ROOT + MEDIA + OVERLAYS
   ========================================================================== */

export const root = style({
	display: 'flex',
	alignItems: 'center',
	position: 'relative',
	minHeight: '100vh',
	overflow: 'hidden',
	isolation: 'isolate',
});

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

export const overlays = style({
	...fullSizeOfParent(),
	zIndex: 1,
	pointerEvents: 'none',
	position: 'absolute',
	inset: 0,
});

/** Subtle static grain to break banding */
export const grain = style({
	...fullSizeOfParent(),
	...noiseBg({ opacity: 0.25 }),
});

/** Faint multi-stop wash to even flat backgrounds */
const washTop = colorVars.shadow.alpha(0.3).css();
const washMid = colorVars.white.alpha(0.1).css();
const washBot = colorVars.black.alpha(0.6).css();

export const wash = style({
	...fullSizeOfParent(),
	backgroundImage: `linear-gradient(180deg, ${washTop} 0%, ${washMid} 45%, ${washBot} 100%)`,
	mixBlendMode: 'soft-light',
	opacity: 0.5,
});

/** Soften center area */
export const centerSoften = style({
	...fullSizeOfParent(),
	backgroundImage: `radial-gradient(
    140% 100% at 50% 0%,
    ${colorVars.shadow.alpha(1).css()} 0%,
    ${colorVars.shadow.alpha(0.15).css()} 42%,
    ${colorVars.shadow.alpha(0).css()} 70%
  )`,
});

/** Break ring radius with soft band */
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

/* ============================================================================
   CONTENT / PANELS
   ========================================================================== */

export const content = style({
	position: 'relative',
	zIndex: 2,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
});

export const paragraph = style({
	position: 'relative',
	textAlign: 'center',
	fontSize: m(26).css(),
	...fontWeightStyle(fontVars.hero, 0),
	lineHeight: 1,
	textShadow: `2px 2px 5px ${colorVars.black.css()}`,
	...margins({
		all: 0,
		top: m(30),
	}),
});

// Optional: use your palette tones if you prefer
const warmA = chroma('#ffffffff');
const warmB = chroma('#b98cde');

// Gentle pulsing glow
const gentleGlow = keyframes({
	'0%, 100%': {
		textShadow: `
			0 0 1px ${warmA.alpha(0.4).css()},
			0 0 3px ${warmA.alpha(0.15).css()}
		`,
		filter: 'brightness(1)',
	},
	'50%': {
		textShadow: `
			0 0 2px ${warmA.alpha(0.8).css()},
			0 0 5px ${warmA.alpha(0.35).css()}
		`,
		filter: 'brightness(1.1)',
	},
});

globalStyle(`.${paragraph} strong`, {
	display: 'inline-block',
	background: `linear-gradient(90deg, ${warmA.css()}, ${warmB.css()})`,
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',
	color: 'transparent',
	animation: `${gentleGlow} 5s ease-in-out infinite`,
});

// Do not export
const offset = m(40);

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

/* ============================================================================
   TITLE — PIXEL-ACCURATE TO ORIGINAL HTML
   ========================================================================== */

/** Exact colour math from original HTML */
const TITLE_LEFT = chroma('#88dbfc').saturate(0.2).hex(); // contrast_a
const TITLE_RIGHT = chroma('#f4a5ff').saturate(0.2).hex(); // contrast_b
const TITLE_MERGE = chroma('#5b4199').darken(0.2).hex(); // darker

/** Identical sweep timing (R→L then idle) — single-layer (::after) */
const shimmerSweep = keyframes({
	'0%': { backgroundPosition: '120% 50%' },
	'70%': { backgroundPosition: '-120% 50%' },
	'100%': { backgroundPosition: '-120% 50%' },
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
	lineHeight: 1,
	fontSize: 'clamp(32px, 7vw, 80px)',
	marginTop: fontVars.hero.offsetToFlushTop?.css(),
	...paddings({
		top: m(5),
	}),
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
			background: `radial-gradient(
        45% 70% at 50% 50%,
        ${colorVars.white.alpha(0.22).css()},
        ${colorVars.white.alpha(0).css()} 65%
      )`,
			pointerEvents: 'none',
			zIndex: 0,
			animation: `${mergePulse} 11s ease-in-out infinite`,
			'@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
		},
	},
});

/**
 * Text lines — base gradient on the element (static), sheen on ::after
 * (animated). Uses only colorVars.white/black for highlights/shadows. For the
 * sheen to show, set the same text content on a data attribute
 * (data-text="...") so ::after can render it.
 */
export const line = style({
	display: 'inline-block',
	position: 'relative',
	zIndex: 1,

	// Safari-safe masking on the base text
	color: 'transparent',
	WebkitTextFillColor: 'transparent',
	backgroundClip: 'text',
	WebkitBackgroundClip: 'text',

	// base gradient (static), like the HTML <span class="text">
	backgroundRepeat: 'no-repeat',
	backgroundSize: '200% 100%',
	backgroundPosition: '50% 50%',

	// use your black var for shadows (no rgba)
	textShadow: [
		`0 1px 0 ${colorVars.black.alpha(0.12).css()}`,
		`0 6px 24px ${colorVars.black.alpha(0.1).css()}`,
	].join(', '),

	selectors: {
		'&[data-position="first"]': {
			backgroundImage: `linear-gradient(to right, ${TITLE_LEFT} 30%, ${TITLE_MERGE} 70%)`,
		},
		'&[data-position="last"]': {
			marginTop: '-0.08em',
			backgroundImage: `linear-gradient(to left, ${TITLE_RIGHT} 0%, ${TITLE_MERGE} 70%)`,
		},

		// sheen layer — matches the HTML ".line::after" approach
		'&::after': {
			content: 'attr(data-text)', // requires the same text on data-text
			position: 'absolute',
			inset: 0,

			// mask the pseudo to the text as well
			color: 'transparent',
			WebkitTextFillColor: 'transparent',
			backgroundClip: 'text',
			WebkitBackgroundClip: 'text',

			// moving highlight only (uses colorVars.white)
			backgroundImage: `linear-gradient(75deg,
        ${colorVars.white.alpha(0).css()} 42%,
        ${colorVars.white.alpha(0.85).css()} 50%,
        ${colorVars.white.alpha(0).css()} 58%
      )`,
			backgroundRepeat: 'no-repeat',
			backgroundSize: '200% 100%',
			backgroundPosition: '120% 50%',

			mixBlendMode: 'screen',
			pointerEvents: 'none',
			animation: `${shimmerSweep} 6.5s linear infinite`,
			'@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
		},
	},
});
