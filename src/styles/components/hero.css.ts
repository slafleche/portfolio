import { style, globalStyle } from '@vanilla-extract/css';
import { fullSizeOfParent } from '../helpers/positioning';
import { noiseBg } from '../helpers/noiseSVG';
import { colorVars } from '../vars';

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
	}), // uses your existing noiseSVG helper
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
	mixBlendMode: 'multiply',
});

/** Break the donut/ring radius with a soft band so it stops catching the eye */
export const ringBreaker = style({
	...fullSizeOfParent(),
	backgroundImage: `radial-gradient(
    68% 52% at 50% 60%,
    transparent 0%,
    ${colorVars.black.alpha(0.028).css()} 52%,
    ${colorVars.black.alpha(0.05).css()} 68%,
	${colorVars.black.alpha(0).css()}  86%
	)`,
	mixBlendMode: 'soft-light',
});

export const content = style({
	position: 'relative',
	zIndex: 2,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '20px',
});

export const heading = style({
	textShadow: '0 0 10px rgba(0,0,0,.72)',
	textAlign: 'center',
});

export const paragraph = style({
	textAlign: 'center',
});

export const panel = style({
	width: 'fit-content',
	maxWidth: 'min(90vw, 640px)',
	padding: '20px',
	gap: '20px',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	alignSelf: 'center',
	margin: '0 auto',
});
