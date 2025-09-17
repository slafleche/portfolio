import { measurement } from './measurement';

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
  // shadow: '0 12px 24px hsla(0 0% 100% / 0.06)',
  // radius: '18px',
  // padding: '24px',
  blur: '20px',
  noiseDataUri: `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`,
};

export const glossyBorderVars = {
  thickness: measurement(7),
  baseColor: 'rgba(255,255,255,0.18)', // subtle glass sweep
  hotAlpha: 0.22, // hotspot strength
  hotCx: 0.5, // hotspot center (objectBoundingBox coords 0..1)
  hotCy: 0.92, // near bottom tip
  clipRx: 0.36, // horizontal radius (0..1, bbox units)
  clipRy: 0.22, // vertical radius   (0..1, bbox units)
  hotR: 0.42,
  hotScaleX: 0.4,
  hotScaleY: 0.32,
  // Smooth sweep around the edge
  base: `conic-gradient(
    from 200deg at 50% 50%,
    hsla(0,0%,100%,0.55) 0deg,
    hsla(0,0%,100%,0.22) 120deg,
    hsla(0,0%,100%,0.06) 210deg,
    transparent 1turn
  )`,
  // Bottom-center hotspot to accent the “tip”
  hot: `radial-gradient(
    120% 80% at 50% 92%,
    hsla(0,0%,100%,0.26) 0%,
    hsla(0,0%,100%,0.08) 55%,
    transparent 70%
  )`,
};
