import { color, type Color } from '@/styles/helpers/colorWrap';
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
import fontsConfig, {
	makeFamilyDef,
} from '@/styles/helpers/fontConfig';

// Chroma color objects for use in non-CSS contexts or helpers
// Separate from colorVars as they could eventually be overwritable and are
// meant to be more abstract and used in different wayt. For example, you
// could flip the fg and bg colours if you want a dark/light mode or you
// could do math on a value.

const backgroundColour = color('#453564');
// Target colour: #2c244b on #453564
const shadow = backgroundColour
	.darken(0.8)
	.desaturate(0.2)
	.alpha(0.5);

export const themeColours = {
	lights: {
		a: color('#88dbfc'), // Electric blue
		b: color('#f4a5ff'), // Hot Pink
		c: color('#F7D354'), // Yellow
		d: color('#a283eb'), // Light Violet
	},
	darks: {
		a: backgroundColour,
	},
};

export const gradients = [
	{
		linear: [
			{
				color: color.create.rgb(103, 52, 153),
				at: 0,
			},
			{
				color: color.create.rgb(110, 77, 204),
				at: 50,
				blend: 0.3,
			},
			{
				color: color.create.rgb(91, 102, 214),
				at: 100,
			},
		],
		spots: [
			{
				color: color.create.rgb(219, 88, 181),
				x: 70,
				y: 30,
				softenL: 30,
			},
			{
				color: color('#b98cde'),
				x: 35,
				y: 65,
			},
			{
				color: color('#e1864e'),
				x: 50,
				y: 80,
			},
		],
	},
	{
		linear: [
			{
				color: color.create.rgb(229, 90, 179),
				at: 0,
			},
			{
				color: color.create.oklch('0.56 0.17 274.53'),
				at: 100,
			},
			{
				color: color.create.oklch('0.56 0.17 274.53'),
				at: 100,
			},
		],
		spots: [
			{
				color: color('#5b419a'),
				x: 40,
				y: 40,
			},
			{
				color: color('#b98cde'),
				x: 60,
				y: 55,
			},
			{
				color: color('#e1864e'),
				x: 80,
				y: 70,
			},
		],
	},
];

export const bokehVars = {
	// Default Bokeh overlay settings (consumed by components)
	colors: [
		gradients[1].linear[0].color,
		gradients[1].linear[1].color,
		gradients[1].linear[2].color,
		gradients[1].spots[0].color,
		gradients[0].spots[2].color,
	],
	opacity: 0.2,
	blendMode: 'screen' as CSS.Property.MixBlendMode,
	blur: 50,
	blurScale: 1,
	sizeScale: 0.7,
	fadeMs: 300,
};

// export const gradientFull = {
// 	overlayA: gradients.b_spot_a,
// 	overlayB: gradients.b_spot_b,
// 	linear: [
// 		gradients.b_linear_a,
// 		gradients.b_linear_b,
// 		gradients.b_linear_c,
// 	] as [ColorWrapper, ColorWrapper, ColorWrapper],
// };

// export const gradientA = {
// 	overlayA: gradients.gradients,
// 	overlayB: gradients.base_b,
// 	linear: as[(ColorWrapper, ColorWrapper)],
// };

// export const gradientB = {
// 	overlayA: gradients.b_spot_a,
// 	overlayB: gradients.b_spot_b,
// 	linear: [
// 		gradients.b_linear_a,
// 		gradients.b_linear_b,
// 		gradients.b_linear_c,
// 	] as [ColorWrapper, ColorWrapper, ColorWrapper],
// };

// var gradientBlues = {

//   #5A2D92 0%,   /* deep violet */
//   #5A8CC7 45%,  /* blue */
//   #5ECCE5 75%,  /* cyan */
//   #63E3F0 90%,  /* aqua highlight */
//   #7C73A0 100%  /* muted violet tail */
// }

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
		[
			'Poppins',
			'Comfortaa',
			'Helvetica',
			'Arial',
			'sans-serif',
		],
		fontsConfig,
		m(0.3, 'rem'),
		m(-0.3, 'rem'),
	),
	comfortaa: makeFamilyDef(
		'Comfortaa',
		[
			'Poppins',
			'Helvetica',
			'Arial',
			'sans-serif',
		],
		fontsConfig,
		m(0.3, 'rem'),
		m(0, 'rem'),
	),
	titan_one: makeFamilyDef(
		'Titan One',
		[
			'sans-serif',
		],
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

export type BorderWidthInput =
	| BorderMeasurementInput
	| BorderWidthConfig;

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
				color: gradients[1].linear[1].color,
				// color: gradients.b_linear_b,
				posX: 24,
				posY: 38,
				radius: 46,
				intensity: 0.32,
			},
			{
				color: gradients[1].linear[0].color,
				posX: 62,
				posY: 58,
				radius: 48,
				intensity: 0.28,
			},
			{
				color: gradients[1].linear[2].color,
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
				// color: gradients.b_linear_b,
				color: gradients[1].linear[1].color,
				posX: 22,
				posY: 48,
				radius: 50,
				intensity: 0.62,
			},
			{
				color: gradients[1].linear[0].color,
				// color: gradients.b_spot_a,
				posX: 50,
				posY: 72,
				radius: 50,
				intensity: 0.6,
			},
			{
				color: gradients[1].linear[2].color,
				// color: gradients.b_linear_c,
				posX: 76,
				posY: 30,
				radius: 46,
				intensity: 0.48,
			},
			{
				color: gradients[0].linear[0].color,
				// color: gradients.a_spot_a,
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

export const glowVars = {
	mix: {
		base: 0.45,
		fill: 0.7,
		sustain: 0.55,
	},
	blur: {
		primary: 14,
		secondary: 32,
	},
};

const baseColor = colorVars.white.mix(colorVars.bodyBg, 0.5);

export const chevronVars = {
	width: m(40),
	padding: m(20),
	height: 'auto',
	display: 'block',
	fill: baseColor,
	gradientStart: baseColor,
	gradientMid: baseColor,
	gradientMidOffset: 0.7,
	gradientEnd: colorVars.black.mix(baseColor, 0.5),
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

export const consoleVars = {
	borders: {
		radius: m(18),
	},
};
