import { style, globalStyle, keyframes } from '@vanilla-extract/css';
import { fullSizeOfParent } from '../helpers/positioning';
import { noiseBg } from '../helpers/noiseSVG';
import { colorVars, themeColours, fontVars } from '../vars';
import transforms from '../helpers/transforms';
import { m } from '../helpers/measurement';
import { margins, paddings } from '../helpers/spacing';

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
	...noiseBg({
		opacity: 0.25,
	}),
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

export const content = style({
	position: 'relative',
	zIndex: 2,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	// gap: '20px',
});

export const heading = style({
	textShadow: '0 0 10px rgba(0,0,0,.72)',
	textAlign: 'center',
	fontFamily: fontVars.hero.fontFamily.family,
	fontWeight: fontVars.hero.fontWeight,
	fontSize: fontVars.hero.size.css(),
});

export const paragraph = style({
	textAlign: 'center',
});

// Do not export
const offset = m(50);

export const vennContainer = style({
	position: 'relative',
	// outline: 'solid red 1px',
	...paddings({
		all: offset.css(),
	}),
	...margins({
		all: offset.css(),
	}),
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
	// outline: 'solid white 1px',
	transform: transforms.value(transforms.translate(offset, offset.negation())),
});

export const vennMiddle = style({
	padding: offset.double().css(),
});

export const panel = style({
	position: 'relative',
	width: 'fit-content',
	// maxWidth: 'min(90vw, 640px)',
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
