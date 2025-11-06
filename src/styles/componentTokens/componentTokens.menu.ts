import { color } from '../helpers/colorWrap';
import { m, mPercent } from '../measurementKit';
import {
	archVars,
	colorVars,
	themeColours,
} from './componentTokens.global';

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
		max: 2, // Max rotation
	},
	textShadow: {
		offsetX: m(2),
		offsetY: m(2),
		blur: m(4),
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
	},
	blobDefaults: {
		opacity: 0.6,
		blur: m(15),
		scale: 1,
		size: mPercent(85),
		radius: 50,
	},
	blobs: [
		{
			color: themeColours.lights.a,
			posX: 22,
			posY: 48,
			intensity: 0.62,
		},
		{
			color: themeColours.lights.b,
			posX: 50,
			posY: 72,
			intensity: 0.6,
		},
		{
			color: themeColours.lights.c,
			posX: 76,
			posY: 30,
			radius: 46,
			intensity: 0.48,
		},
		{
			color: themeColours.lights.d,
			posX: 34,
			posY: 82,
			radius: 54,
			intensity: 0.66,
		},
	],
} as const;

export const menuLinkVars = {
	nav: {
		color: color('#ffffff'),
	},
	locale: {
		color: color('#ffffff'),
	},
} as const;

export type MenuLinkVars = typeof menuLinkVars;
