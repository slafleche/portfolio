import { globalStyle, style } from '@vanilla-extract/css';
import { m, mEm } from 'css-calipers';

import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import { colorVars } from '../../tokens/global.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { brickLayout } from '../componentTokens/brick.component.tokens';
import { borders } from '../helpers/borders.helper';
import { makeGlassSurface } from '../helpers/glassy.helper';
import { outlines } from '../helpers/outlines.helper';
import { boxShadow, textShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { fontStylesFromFontVariant } from '../helpers/typography.helper';
import {
  componentMediaQueries,
  mediaQueryStyle,
} from '../responsive/mediaQueries';
import { userContent } from '../typography.css';

const paddingDefault = brickLayout.paddings;
const paddingTight = anchorMenuVars.handle.sizeWithBorder;
const titleLineHeight = 1.2;
const titleFontSize =
  typographyFontVariants.h3.config?.styleOverrides?.size ?? m(26);
const titleLineHeightMeasurement =
  titleFontSize.multiply(titleLineHeight);
const minHeight = paddingDefault
  .add(titleLineHeightMeasurement.multiply(2))
  .add(paddingDefault);

export const root = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: minHeight.css(),
  overflow: 'hidden',
  ...borders({
    width: m(1),
    color: colorVars.white.alpha(0.5),
    radius: m(40),
  }),
  ...outlines({
    width: m(1),
    color: colorVars.black.alpha(0.4),
    offset: m(0),
  }),
  ...boxShadow(),
  ...paddings(brickLayout.paddings),
  ...makeGlassSurface(),
  selectors: {
    ...componentMediaQueries({
      bricks_twoColumn: {
        backgroundColor: colorVars.white.alpha(0.18).css(),
      },
      bricks_oneColumn: {
        backgroundColor: colorVars.white.alpha(0.18).css(),
      },
    }),
  },
});

export const heroPlacement = style({
  gridColumn: 'span 1',
  gridRow: 'span 2',
  selectors: {
    ...componentMediaQueries({
      bricks_twoColumn: {
        gridColumn: 'span 2',
        gridRow: 'span 1',
      },
      bricks_oneColumn: {
        gridColumn: 'span 1',
        gridRow: 'span 1',
      },
    }),
  },
});

export const iconAsBg = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  opacity: 0.1,
  zIndex: 0,
  color: colorVars.black.css(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
});

// Per-icon hooks — empty by default so you can hand-tune each icon's
// size/position/transform/opacity in isolation later.
export const iconAsBg_headCircuit = style({});
export const iconAsBg_trafficLights = style({});
export const iconAsBg_construction = style({});
export const iconAsBg_bugOff = style({});
export const iconAsBg_bookCheck = style({});

export const content = style({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(2),
    color: colorVars.black,
  }),
});

export const title = style({
  display: 'block',
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(2),
    color: colorVars.black,
  }),
  ...fontStylesFromFontVariant({
    variant: typographyFontVariants.h3,
    baseVariant: typographyFontVariants.heading,
    extraConfig: {
      styleOverrides: {
        lineHeight: titleLineHeight,
      },
    },
  }),
  ...margins({ top: mEm(-0.18) }),
  ...paddings({ top: 0, bottom: mEm(1.1) }),
  textAlign: 'left',
});

export const separator = style({
  width: `calc(100% + ${paddingDefault.double().css()})`,
  ...margins({
    left: paddingDefault.negation(),
    bottom: paddingDefault,
  }),
  ...borders({
    bottom: {
      width: m(0.5),
      color: colorVars.white.alpha(0.5),
    },
  }),
  selectors: {
    ...mediaQueryStyle({
      snug: {
        width: `calc(100% + ${paddingTight.double().css()})`,
        ...margins({
          left: paddingTight.negation(),
          bottom: m(30),
        }),
      },
    }),
  },
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
});

globalStyle(`.${body} .${userContent} p[data-last="true"]`, {
  ...paddings({ bottom: 0 }),
  ...margins({ bottom: 0 }),
});
