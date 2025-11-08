import { m } from '../measurementKit';
import type { IMeasurement } from '../measurementKit';
import type { CSS_TYPES } from '@/styles/helpers/types.helper';
export interface NoiseSvgOptions {
  opacity?: number;
  baseFrequency?: number;
  numOctaves?: number;
  width?: IMeasurement;
  height?: IMeasurement;
}

export function createNoiseSvg(id: string, props?: NoiseSvgOptions) {
  const {
    opacity = 0.8,
    baseFrequency = 0.8,
    numOctaves = 2,
    width = m(60),
    height = m(60),
  } = props || {};

  return `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width.css()}" height="${height.css()}">
        <filter id="${id}">
            <feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="${numOctaves}" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#${id})" opacity="${opacity}"/>
        </svg>
    `.trim();
}

export function noiseStyle(id: string, props?: NoiseSvgOptions) {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(createNoiseSvg(id, props))}")`;
}

export function noiseBg(props?: {
  backgroundImage?: CSS_TYPES.Property.BackgroundImage | null;
  backgroundRepeat?: CSS_TYPES.Property.BackgroundRepeat;
  backgroundSize?: CSS_TYPES.Property.BackgroundSize;
  mixBlendMode?: CSS_TYPES.Property.MixBlendMode;
  opacity?: CSS_TYPES.Property.Opacity;
  noiseId?: string;
  noiseOptions?: NoiseSvgOptions;
}) {
  const {
    backgroundImage,
    backgroundRepeat = 'repeat',
    backgroundSize = '240px 240px',
    mixBlendMode = 'overlay',
    opacity = '0.03',
    noiseId = 'noise',
    noiseOptions,
  } = props || {};
  const style: {
    backgroundRepeat: CSS_TYPES.Property.BackgroundRepeat;
    backgroundSize: CSS_TYPES.Property.BackgroundSize;
    mixBlendMode: CSS_TYPES.Property.MixBlendMode;
    opacity: CSS_TYPES.Property.Opacity;
    backgroundImage?: CSS_TYPES.Property.BackgroundImage;
  } = {
    backgroundRepeat,
    backgroundSize,
    mixBlendMode,
    opacity,
  };
  if (backgroundImage !== null) {
    style.backgroundImage =
      backgroundImage ??
      (noiseStyle(
        noiseId,
        noiseOptions,
      ) as CSS_TYPES.Property.BackgroundImage);
  }
  return style;
}
