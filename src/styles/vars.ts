import chroma, { type Color } from 'chroma-js';
import * as CSS from 'csstype';
import { IMeasurement, m } from './helpers/measurement';
import { computeFontWeight, fontWeightStyle } from './helpers/typography';
export type ColorKeys = keyof typeof colors;
export type ChromaColor = Color;

// Chroma color objects for use in non-CSS contexts or helpers
// Separate from colorVars as they could eventually be overwritable and are
// meant to be more abstract and used in different wayt. For example, you
// could flip the fg and bg colours if you want a dark/light mode or you
// could do math on a value.

// const backgroundColour = chroma('#453564');
const backgroundColour = chroma('#251e32');
// Target colour: #2c244b on #453564
const shadow = backgroundColour.darken(0.8).desaturate(0.2).alpha(0.5);

const gradients = {
	a_linear_a: chroma('#322b4d'),
	a_linear_b: chroma('#6263b5'),
	a_linear_c: chroma('#5d4cb9'),

	a_spot_a: chroma('#99b7fd'),
	a_spot_b: chroma('#90faf7'),

	// Card B
	b_linear_a: chroma('#5b419a'),
	b_linear_b: chroma('#b98cde'),
	b_linear_c: chroma('#e1864e'),

	b_spot_a: chroma('#E15DAE'),
	b_spot_b: chroma('#F7D354'),
};

export const bokenVars = {
	// Default Bokeh overlay settings (consumed by components)
	colors: [
		gradients.b_linear_a,
		gradients.b_linear_b,
		gradients.b_linear_c,
		gradients.b_spot_a,
		gradients.a_linear_c,
	],
	opacity: 0.2,
	blendMode: 'screen' as CSS.Property.MixBlendMode,
	blur: 50,
	blurScale: 1,
	sizeScale: 0.7,
	fadeMs: 300,
};
// export const bokehColours = {
//   a: a_linear_a,
//   b:
// };

export const gradientFull = {
	overlayA: gradients.b_spot_a,
	overlayB: gradients.b_spot_b,
	linear: [gradients.b_linear_a, gradients.b_linear_b, gradients.b_linear_c],
};

export const gradientA = {
	overlayA: gradients.a_spot_a,
	overlayB: gradients.a_spot_b,
	linear: [gradients.a_linear_a, gradients.a_linear_b, gradients.a_linear_c],
};

export const gradientB = {
	overlayA: gradients.b_spot_a,
	overlayB: gradients.b_spot_b,
	linear: [gradients.b_linear_a, gradients.b_linear_b, gradients.b_linear_c],
};

// var gradientBlues = {

//   #5A2D92 0%,   /* deep violet */
//   #5A8CC7 45%,  /* blue */
//   #5ECCE5 75%,  /* cyan */
//   #63E3F0 90%,  /* aqua highlight */
//   #7C73A0 100%  /* muted violet tail */
// }

// background-image:
//   radial-gradient(chroma
//     circle at 100% 49%,
//     rgba(225,93,174,1.0) 0%,
//     rgba(225,93,174,0.85) 25%,
//     rgba(225,93,174,0.65) 40%,
//     rgba(225,93,174,0.35) 60%,
//     rgba(225,93,174,0.0) 80%
//   ),
//   radial-gradient(
//     circle at 97% 98%,
//     rgba(247,211,84,0.6) 0%,
//     rgba(247,211,84,0.0) 30%
//   ),
//   linear-gradient(
//     to bottom,
//     #5b419a 20%,
//     #b98cde 55%,
//     #e1864e 90%
//   );
// background-blend-mode: overlay, screen, normal;

// background-image:
//   radial-gradient(circle at 100% 49%, rgba(225,93,174,1.00) 0%, rgba(225,93,174,0.90) 18%, rgba(225,93,174,0.55) 30%, rgba(225,93,174,0.20) 42%, rgba(225,93,174,0.00) 62%),
//   radial-gradient(circle at 97% 98%, rgba(247,211,84,0.63) 0%, rgba(247,211,84,0.00) 26%),
//   linear-gradient(to bottom, #5b419a 19%, #b98cde 55%, #e1864e 93%);
// background-blend-mode: overlay, screen, normal;

// Meant to easily overwrite the defaults with theming
// Note the goal isn't for the new theme to use exactly the same calculations
// for the shadows or anything else, the goal is to write a custom .ts file
// with the new themes's rules.

export const defaults = {
	backgroundColour,
	shadow,
	gradients,
	fg: chroma('#ffffff'),
	bg: chroma('#000000'),
};

export const colors = {
	// Main Colours
	brand: chroma('#5b4199'),
	contrast: chroma('#88dbfc'),
	// Nav
	// navBg: chroma('#252136'),
	navFg: defaults.fg,
	// Body
	bodyBg: defaults.backgroundColour,

	bodyFg: defaults.fg,
	// Text
	headingFg: defaults.fg,
	// Shadows
	shadow,
	// Borders
	border: chroma('#1d1d1f'),

	// Gradient A
	gradientA_main_start: chroma('#573f97'),
	gradientA_main_end: chroma('#9d4e9c'),

	gradientA_secondary_start: chroma('#f6debc'),
	gradientA_secondary_middle: chroma('#e6a87f'),
	gradientA_secondary_end: chroma('#ed79a8'),

	// Utility colours for mixing
	black: chroma('#000000'),
	white: chroma('#ffffff'),
	transparent: chroma('#ffffff').alpha(0),
} as const;

export const fontFamilies = {
	baloo: {
		family: '"Baloo 2", Poppins, Comfortaa, Helvetica, Arial, sans-serif',
		weights: {
			low: 400,
			high: 800,
		},
		spacing: m(0.3, 'rem'),
	},
	comfortaa: {
		family: 'Comfortaa, Poppins, Helvetica, Arial, sans-serif',
		weights: {
			low: 300,
			high: 700,
		},
		spacing: m(0.3, 'rem'),
	},
};

export const font = {
	heading: {
		...fontFamilies.baloo,
	},
	h1: {
		size: m(45),
		...fontWeightStyle(fontFamilies.baloo, 70),
	},
	h2: {
		size: m(25),
		...fontWeightStyle(fontFamilies.baloo, 60),
	},
	h3: {
		size: m(20),
		...fontWeightStyle(fontFamilies.baloo, 50),
	},
	body: {
		size: m(22),
		...fontFamilies.comfortaa,
		...fontWeightStyle(fontFamilies.comfortaa, 60),
		weight: computeFontWeight(fontFamilies.comfortaa, 60),
		semiBold: computeFontWeight(fontFamilies.comfortaa, 70),
	},
} as const;

export const colorVars = {
	// Main Colours
	brand: colors.brand,
	contrast: colors.contrast,
	// Nav
	navFg: colors.navFg,
	navBg: colors.shadow,
	// Body
	bodyBg: colors.bodyBg,
	bodyFg: colors.bodyFg,

	// Text
	headingFg: colors.headingFg,

	// Shadows
	shadow: colors.shadow,
	// Borders
	border: colors.border,

	// Contrast Section
	// contrastBg: colors.contrastBg,

	// Gradient A
	gradientA_main_start: colors.gradientA_main_start,
	gradientA_main_end: colors.gradientA_main_end,

	gradientA_secondary_start: colors.gradientA_secondary_start,
	gradientA_secondary_middle: colors.gradientA_secondary_middle,
	gradientA_secondary_end: colors.gradientA_secondary_end,

	// Utility colours for mixing
	black: colors.black,
	white: colors.white,
	transparent: colors.transparent,
};

export interface IBorder {
	color?: CSS.Property.BorderColor;
	width?: IMeasurement;
	style?: 'none' | 'solid';
	radius?: IMeasurement;
}

export const borderVars = {
	color: colorVars.border,
	style: 'solid' as string,
	width: m(4),
	radius: m(6),
};

export const fontVars = {
	menu: {
		size: m(16),
		relativeWeight: 50,
	},
	heading: {
		color: colorVars.headingFg,
		family: font.heading.family,
	},
	h1: {
		...font.h1,
	},
	h2: {
		...font.h2,
	},
	h3: {
		...font.h3,
	},
	body: {
		family: font.body.family,
		size: font.body.size,
		weight: font.body.weight,
		semiBold: font.body.semiBold,
		color: colorVars.bodyFg,
	},
};

export const archVars = {
	top: m(55),
	curveHeight: m(20),
	ry: m(70),
	bumpHeight: m(12),
	bumpWidth: m(60),
	bumpBaseWidth: 0.9,
	bumpTipWidth: m(9),
};

export const logoVars = {
	width: m(65),
	offsetY: m(0),
	offsetX: m(0),
	shadowRatio: 948.31276 / 546.93464, // from shadow width (in the SVG) / logo width
	focus: {
		scale: 1.15,
		transitionMs: 400,
		haloColor: colorVars.contrast.alpha(0.35),
	},
	hover: {
		blobs: [
			{
				color: gradients.b_linear_b,
				posX: 24,
				posY: 38,
				radius: 46,
				intensity: 0.32,
			},
			{
				color: gradients.b_spot_a,
				posX: 62,
				posY: 58,
				radius: 48,
				intensity: 0.28,
			},
			{
				color: gradients.b_linear_c,
				posX: 42,
				posY: 72,
				radius: 44,
				intensity: 0.24,
			},
		],
		squareSizeMultiplier: 2.4,
		squareBlur: 18,
		squareOpacity: 1,
		durationMs: 1800,
		speedMultiplier: 1,
		outline: {
			color: colorVars.contrast.alpha(0.6),
			width: m(2),
			offset: m(6),
		},
	},
};

export const menuVars = {
	height: archVars.top,
	yOffset: m(0),
	rotationMax: m(2, 'deg'),
	skew: m(4, 'deg'),
	verticalOffset: m(1),
	locale: {
		offsetY: m(2),
		opacity: 0.6,
	},
	padding: {
		horizontal: m(25),
		vertical: m(10),
	},
	rotation: {
		k: 600, // modifies how "quickly" you meet the limit
		max: 2, //Max rotation
	},
	textShadow: {
		offsetX: m(2),
		offsetY: m(2),
		blur: m(2),
		color: colorVars.navBg,
	},
	hover: {
		text: {
			offsetX: m(2),
			offsetY: m(-2),
			scale: 1.05,
		},
		blobs: [
			{
				color: gradients.b_linear_b,
				posX: 22,
				posY: 48,
				radius: 50,
				intensity: 0.32,
			},
			{
				color: gradients.b_spot_a,
				posX: 50,
				posY: 72,
				radius: 50,
				intensity: 0.3,
			},
			{
				color: gradients.b_linear_c,
				posX: 76,
				posY: 30,
				radius: 46,
				intensity: 0.28,
			},
			{
				color: gradients.a_spot_a,
				posX: 34,
				posY: 82,
				radius: 54,
				intensity: 0.26,
			},
		],
		blur: m(14),
		shadow: {
			spread: m(28),
			opacity: 0.14,
		},
	},
};

export const dropShadowVars = {
	offsetX: m(12),
	offsetY: m(12),
	blur: m(3),
	color: colorVars.shadow,
};

export const chevronVars = {
	width: m(40),
	padding: m(20),
	height: 'auto',
	display: 'block',
	fill: colorVars.white,
	gradientStart: colorVars.white,
	gradientMid: colorVars.white,
	gradientMidOffset: 0.7,
	gradientEnd: colorVars.black.brighten(2),
	highlight: colorVars.white,
};

export const heroVars = {
	paddings: {
		top: m(40),
		bottom: m(40),
	},
};
