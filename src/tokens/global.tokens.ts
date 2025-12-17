import { color } from '../styles/helpers/colorWrap.helper';
import type { CardGradientPack } from '../styles/helpers/cardGradient.helper';
import type { CSS_TYPES } from '@/styles/helpers/types.helper';
import { m, type IMeasurement } from 'css-calipers';
export type ColorKeys = keyof typeof colors;

export type {
  BorderMeasurementInput,
  BorderWidthConfig,
  BorderWidthInput,
  BorderRadiusConfig,
  BorderRadiusInput,
  IBorder,
} from '../styles/helpers/types.helper';

// Chroma color objects for use in non-CSS contexts or helpers
// Separate from colorVars as they could eventually be overwritable and are
// meant to be more abstract and used in different wayt. For example, you
// could flip the fg and bg colours if you want a dark/light mode or you
// could do math on a value.

const backgroundColour = color('#020014');
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

export const gradients: CardGradientPack[] = [
  {
    linear: [
      {
        color: color('#51287a'),
        at: 0,
      },
      {
        color: color('#51287a'),
        at: 30,
        blend: 1,
      },
      {
        color: color('#5B66D6'),
        at: 80,
        blend: 0.3,
      },
      {
        color: color('#6E4DCC'),
        at: 100,
      },
    ],
    spots: [
      {
        color: color('#9BE8FB').alpha(0.5),
        x: 20,
        y: 110,
        scale: 80,
        blendMode: 'normal',
      },
      {
        color: color('#51287a').alpha(0.4),
        x: 90,
        y: 53,
        scale: 100,
        softenL: 10,
        blendMode: 'normal',
      },
      {
        color: color('#287a52').alpha(0.7),
        x: 63,
        y: 100,
        scale: 80,
        blendMode: 'normal',
      },
      {
        color: color('#00ff6e').alpha(0.3),
        x: 80,
        y: 60,
        scale: 80,
        blendMode: 'normal',
      },
      {
        color: color('#ff00bf').alpha(0.6),
        x: 66,
        y: 70,
        scale: 70,
        blendMode: 'normal',
      },
    ],
  },
  {
    linear: [
      {
        color: color('#51287a'),
        at: 0,
      },
      {
        color: color('#7139a5'),
        at: 100,
      },
    ],
    spots: [
      {
        color: color('#ffae00'),
        x: 80,
        y: 100,
        scale: 80,
      },
      {
        color: color('#bd08b4').alpha(0.7),
        x: 95,
        y: 48,
        scale: 80,
        blendMode: 'normal',
      },
      {
        color: color('#cbb358').alpha(0.8),
        x: 20,
        y: 100,
        scale: 75,
        blendMode: 'normal',
      },
      {
        color: color('#b7910a').alpha(0.2),
        x: 17,
        y: 98,
        scale: 85,
      },
      {
        color: color('#4271bb').alpha(0.6),
        x: 10,
        y: 56,
        scale: 100,
      },
    ],
  },
];

export const bokehVars = {
  // Default Bokeh overlay settings (consumed by components)
  colors: [
    gradients[0]?.linear?.[0]?.color ?? themeColours.lights.a,
    // gradients[0].linear[1].color,
    // gradients[1].linear[2].color,
    // gradients[1].spots[0].color,
    // gradients[0].spots[0].color,
    // gradients[0].spots[2].color,
  ],
  opacity: 0.2,
  blendMode: 'screen' as CSS_TYPES.Property.MixBlendMode,
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

type PxMeasurement = IMeasurement<'px'>;

interface ArchVars {
  top: PxMeasurement;
  curveHeight: PxMeasurement;
  ry: PxMeasurement;
  bumpHeight: PxMeasurement;
  bumpWidth: PxMeasurement;
  bumpBaseWidth: number;
  bumpTipWidth: PxMeasurement;
}

export const colors = {
  // Main Colours
  brand: color('#5b4199'),
  contrast: color('#88dbfc'),
  successAccent: color('#34d399'),
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
  successAccent: colors.successAccent,
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

  // SVGs
  svgColor: shadow.alpha(1).mix(colors.white, 0.15),

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
export const borderVars = {
  color: colorVars.border,
  style: 'solid' as string,
  width: m(4),
  radius: m(16),
};

export const archVars: ArchVars = {
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
        color: themeColours.lights.a,
        posX: 24,
        posY: 38,
        radius: 46,
        intensity: 0.32,
      },
      {
        color: themeColours.lights.b,
        posX: 62,
        posY: 58,
        radius: 48,
        intensity: 0.28,
      },
      {
        color: themeColours.lights.d,
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

export const dropShadowVars = {
  offsetY: m(2),
  offsetX: m(2),
  blur: m(2),
  alpha: 1,
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

export const spacingVars = {
  scrollPaddingOffset: m(20),
};

export const consoleVars = {
  borders: {
    radius: m(10),
  },
};
