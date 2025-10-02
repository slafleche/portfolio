import { colorVars, IBorder } from '../vars';
import chroma from 'chroma-js';
import { m } from './measurement';

const noiseSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
</svg>`.trim();

export const glassVars = {
	// Use chroma so callers can derive variants, call .css() where needed
	bg: chroma('white').alpha(0.06),
	tint1: chroma('hsl(210, 80%, 70%)').alpha(0.1),
	tint2: chroma('hsl(280, 80%, 70%)').alpha(0.14),
	border: chroma('white').alpha(0.25),
	innerRim: chroma('white').alpha(0.22),
	blur: m(15),
	// Subtle white overlay settings used by glassy.bg
	overlay: {
		color: chroma('white'),
		topAlpha: 0.05,
		midStop: '45%',
		bottomAlpha: 0.06,
		direction: 'to bottom',
	},
	noiseDataUri: `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`,
};

export const transparentBorder = {
	thickness: m(2),
	rimColor: colorVars.white,
	rimHotPosX: 0.51, // 0..1 → where the hotspot peaks along the stroke
	rimHotCoverage: 0.2, // 0..1 → how much of the stroke is influenced by the hotspot
	rimBaseLeft: 0.1, // left baseline alpha
	rimBaseMid: 0.3, // baseline inside the band
	rimPeak: 0.3, // peak alpha at the hotspot
	rimBaseRight: 0.2, // right baseline alpha
};

export const glossyBorder = {
	// We're layering two effects, so this is the base vars for the parent
	base: {
		radius: m(25),
		color: colorVars.transparent,
	} as unknown as IBorder,
};
