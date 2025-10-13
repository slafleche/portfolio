import {
	color,
	type Color,
	type ColorWrapper,
} from '@/styles/helpers/colorWrap';
import * as CSS from 'csstype';
import { fontWeight } from './helpers/typography';
import type {
	CssLike,
	FontFamilyDef,
	FontStyles,
	MeasurementLike,
} from './helpers/types';
import { m } from './helpers/measurement';
export type ColorKeys = keyof typeof colors;
import fontsConfig, { makeFamilyDef } from '@/styles/helpers/fontConfig';

// Chroma color objects for use in non-CSS contexts or helpers
// Separate from colorVars as they could eventually be overwritable and are
// meant to be more abstract and used in different wayt. For example, you
// could flip the fg and bg colours if you want a dark/light mode or you
// could do math on a value.

// const backgroundColour = color('#453564');
const backgroundColour = color('#251e32');
// Target colour: #2c244b on #453564
const shadow = backgroundColour.darken(0.8).desaturate(0.2).alpha(0.5);

export const themeColours = {
	darker: color('#322b4d'), // Darker purple
	contrast_a: color('#90faf7'), // Electric blue
	contrast_b: color('#E15DAE'), // Hot Pink
	contrast_c: color('#F7D354'), // Yellow
};

const gradients = {
	a_linear_a: themeColours.darker,
	a_linear_b: color('#6263b5'),
	a_linear_c: color('#5d4cb9'),

	a_spot_a: color('#99b7fd'),
	a_spot_b: themeColours.contrast_a,

	// Card B
	b_linear_a: color('#5b419a'),
	b_linear_b: color('#b98cde'),
	b_linear_c: color('#e1864e'),

	b_spot_a: themeColours.contrast_b,
	b_spot_b: themeColours.contrast_c,
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

export const gradientFull = {
	overlayA: gradients.b_spot_a,
	overlayB: gradients.b_spot_b,
	linear: [
		gradients.b_linear_a,
		gradients.b_linear_b,
		gradients.b_linear_c,
	] as [ColorWrapper, ColorWrapper, ColorWrapper],
};

export const gradientA = {
	overlayA: gradients.a_spot_a,
	overlayB: gradients.a_spot_b,
	linear: [themeColours.darker, gradients.a_linear_b, gradients.a_linear_c] as [
		ColorWrapper,
		ColorWrapper,
		ColorWrapper,
	],
};

export const gradientB = {
	overlayA: gradients.b_spot_a,
	overlayB: gradients.b_spot_b,
	linear: [
		gradients.b_linear_a,
		gradients.b_linear_b,
		gradients.b_linear_c,
	] as [ColorWrapper, ColorWrapper, ColorWrapper],
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

const baseColours = {
	backgroundColour,
	shadow,
	gradients,
	fg: color('#ffffff'),
	bg: color('#000000'),
};

export const colors = {
	// Main Colours
	brand: color('#5b4199'),
	contrast: color('#88dbfc'),
	// Nav
	// navBg: color('#252136'),
	navFg: baseColours.fg,
	// Body
	bodyBg: baseColours.backgroundColour,

	bodyFg: baseColours.fg,
	// Text
	headingFg: baseColours.fg,
	// Shadows
	shadow,
	// Borders
	border: color('#1d1d1f'),

	// Gradient A
	gradientA_main_start: color('#573f97'),
	gradientA_main_end: color('#9d4e9c'),

	gradientA_secondary_start: color('#f6debc'),
	gradientA_secondary_middle: color('#e6a87f'),
	gradientA_secondary_end: color('#ed79a8'),

	// Utility colours for mixing
	black: color('#000000'),
	white: color('#ffffff'),
	transparent: color('#ffffff').alpha(0),
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

// Intentionally don't export font delarations, use font instead.
const fontFamilies = {
	baloo: makeFamilyDef(
		'Baloo 2',
		['Poppins', 'Comfortaa', 'Helvetica', 'Arial', 'sans-serif'],
		fontsConfig,
		m(0.3, 'rem'),
		m(-0.3, 'rem'),
	),
	comfortaa: makeFamilyDef(
		'Comfortaa',
		['Poppins', 'Helvetica', 'Arial', 'sans-serif'],
		fontsConfig,
		m(0.3, 'rem'),
		m(0, 'rem'),
	),
	titan_one: makeFamilyDef(
		'Titan One',
		['sans-serif'],
		fontsConfig,
		m(0.1, 'rem'),
		m(0, 'rem'),
	),

	// yanone_kaffeesatz: {
	// 	family:
	// 		'Yanone Kaffeesatz, Comfortaa, Poppins, Helvetica, Arial, sans-serif',
	// 	weights: { low: 200, high: 700 },
	// 	spacing: m(0.3, 'rem'),
	// },
} satisfies Record<string, FontFamilyDef>;

export const fontVars = {
	menu: {
		size: m(18),
		...fontFamilies.baloo,
	},
	hero: {
		...fontFamilies.titan_one,
		...fontWeight(fontFamilies.titan_one, 0),
		lineHeight: 1.1,
		size: m(45),
	},
	heading: {
		...fontFamilies.baloo,
	},
	h1: {
		size: m(45),
		...fontWeight(fontFamilies.baloo, 70),
	},
	h2: {
		size: m(25),
		...fontWeight(fontFamilies.baloo, 60),
	},
	h3: {
		size: m(20),
		...fontWeight(fontFamilies.baloo, 50),
	},
	body: {
		size: m(22),
		color: colorVars.bodyFg,
		...fontFamilies.comfortaa,
		...fontWeight(fontFamilies.comfortaa, 60),
	},
} satisfies Record<string, FontStyles>;

export type BorderMeasurementInput =
	| MeasurementLike
	| number
	| string
	| null
	| undefined;

export interface BorderWidthConfig {
	all?: BorderMeasurementInput;
	horizontal?: BorderMeasurementInput;
	vertical?: BorderMeasurementInput;
	top?: BorderMeasurementInput;
	right?: BorderMeasurementInput;
	bottom?: BorderMeasurementInput;
	left?: BorderMeasurementInput;
}

export type BorderWidthInput = BorderMeasurementInput | BorderWidthConfig;

export interface BorderRadiusConfig {
	all?: BorderMeasurementInput;
	topLeft?: BorderMeasurementInput;
	topRight?: BorderMeasurementInput;
	bottomRight?: BorderMeasurementInput;
	bottomLeft?: BorderMeasurementInput;
}

export type BorderRadiusInput =
	| BorderMeasurementInput
	| BorderMeasurementInput[]
	| BorderRadiusConfig;

export interface IBorder {
	color?: CSS.Property.BorderColor | CssLike | Color;
	width?: BorderWidthInput;
	style?: CSS.Property.BorderStyle;
	radius?: BorderRadiusInput;
}

export const borderVars = {
	color: colorVars.border,
	style: 'solid' as string,
	width: m(4),
	radius: m(6),
};


export const archVars = {
	top: m(55),
	curveHeight: m(15),
	ry: m(70),
	bumpHeight: m(13),
	bumpWidth: m(80),
	bumpBaseWidth: 1,
	bumpTipWidth: m(10),
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
	skew: m(-10, 'deg'),
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
		offsetY: m(4),
		blur: m(2),
		color: colorVars.navBg.darken(0.5),
	},
	hover: {
		text: {
			offsetX: m(4),
			offsetY: m(-4),
			scale: 1.05,
		},
		shadow: {
			spread: m(28),
			opacity: 0.14,
			blur: m(2),
		},
		blur: m(10),
		blobs: [
			{
				color: gradients.b_linear_b,
				posX: 22,
				posY: 48,
				radius: 50,
				intensity: 0.62,
			},
			{
				color: gradients.b_spot_a,
				posX: 50,
				posY: 72,
				radius: 50,
				intensity: 0.6,
			},
			{
				color: gradients.b_linear_c,
				posX: 76,
				posY: 30,
				radius: 46,
				intensity: 0.48,
			},
			{
				color: gradients.a_spot_a,
				posX: 34,
				posY: 82,
				radius: 54,
				intensity: 0.66,
			},
		],
	},
};

export const dropShadowVars = {
	offsetY: m(10),
	offsetX: m(10),
	blur: m(3),
	color: colorVars.shadow,
};

const baseColor = colorVars.white.mix(colorVars.bodyBg, 50);

export const chevronVars = {
	width: m(40),
	padding: m(20),
	height: 'auto',
	display: 'block',
	fill: baseColor,
	gradientStart: baseColor,
	gradientMid: baseColor,
	gradientMidOffset: 0.7,
	gradientEnd: colorVars.black.mix(baseColor, 50),
	highlight: baseColor,
	container: {
		height: m(120),
	},
};

export const heroVars = {
	paddings: {
		top: m(40),
		bottom: m(40),
	},
};

export const spacingVars = {
	scrollPaddingOffset: m(20),
};
