import { colorVars } from '../vars';
import { m } from './measurement';

const noiseSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
</svg>`.trim();

export const glassVars = {
  bg: 'hsla(0 0% 100% / 0.06)',
  tint1: 'hsla(210 80% 70% / 0.10)',
  tint2: 'hsla(280 80% 70% / 0.14)',
  border: 'hsla(0 0% 100% / 0.25)',
  innerRim: 'hsla(0 0% 100% / 0.22)',
  blur: '15px',
  noiseDataUri: `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`,
};

export const glossyBorderVars = {
  thickness: m(4),
  shadowBlur: m(2),
  shadowOffsetX: m(0),
  shadowOffsetY: m(8),
  shadowColor: colorVars.shadow,
  rimColor: colorVars.white,
  rimHotPosX: 0.51, // 0..1 → where the hotspot peaks along the stroke
  rimHotCoverage: 0.2, // 0..1 → how much of the stroke is influenced by the hotspot
  rimBaseLeft: 0.1, // left baseline alpha
  rimBaseMid: 0.3, // baseline inside the band
  rimPeak: 0.3, // peak alpha at the hotspot
  rimBaseRight: 0.2, // right baseline alpha
};
