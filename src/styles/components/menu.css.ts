import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import type { StyleRule } from '@vanilla-extract/css';
import {
  absolutePosition,
  flexPosition,
} from '../helpers/positioning.helper';
import { outlines } from '../helpers/outlines.helper';
import type { ColorWrapper } from '../helpers/colorWrap.helper';
import {
  archVars,
  colorVars,
  dropShadowVars,
  logoVars,
  themeColours,
} from '../componentTokens/global.componentTokens';
import {
  composeFontVariantStyles,
  fontVariants,
} from '../../tokens/fontVariants.tokens';

import { paddings } from '../helpers/spacing.helper';
import {
  assertUnit,
  m,
  mPercent,
  type IMeasurement,
} from '../measurementKit';
import transforms from '../helpers/transforms.helper';
import { menuVars } from '../componentTokens/menu.componentTokens';

if (process.env.NODE_ENV !== 'production') {
  assertUnit(archVars.top, 'px', 'menu archVars.top');
  assertUnit(archVars.curveHeight, 'px', 'menu archVars.curveHeight');
  assertUnit(archVars.bumpHeight, 'px', 'menu archVars.bumpHeight');
  assertUnit(archVars.bumpWidth, 'px', 'menu archVars.bumpWidth');
  assertUnit(archVars.ry, 'px', 'menu archVars.ry');
  assertUnit(dropShadowVars.offsetY, 'px', 'menu dropShadow offsetY');
  assertUnit(dropShadowVars.blur, 'px', 'menu dropShadow blur');
  assertUnit(menuVars.height, 'px', 'menu height');
  assertUnit(
    menuVars.paddings.horizontal,
    'px',
    'menu padding horizontal',
  );
  assertUnit(
    menuVars.paddings.vertical,
    'px',
    'menu padding vertical',
  );
  assertUnit(menuVars.yOffset, 'px', 'menu yOffset');
  assertUnit(menuVars.blobDefaults.blur, 'px', 'menu hover blur');
  assertUnit(
    menuVars.hover.shadow.spread,
    'px',
    'menu hover shadow spread',
  );
  assertUnit(
    menuVars.hover.shadow.blur,
    'px',
    'menu hover shadow blur',
  );
  assertUnit(
    menuVars.hover.text.offsetX,
    'px',
    'menu hover text offsetX',
  );
  assertUnit(
    menuVars.hover.text.offsetY,
    'px',
    'menu hover text offsetY',
  );
  assertUnit(
    menuVars.textShadow.offsetX,
    'px',
    'menu textShadow offsetX',
  );
  assertUnit(
    menuVars.textShadow.offsetY,
    'px',
    'menu textShadow offsetY',
  );
  assertUnit(menuVars.textShadow.blur, 'px', 'menu textShadow blur');
  assertUnit(logoVars.width, 'px', 'menu logo width');
  assertUnit(logoVars.offsetY, 'px', 'menu logo offsetY');
  assertUnit(menuVars.rotationMax, 'deg', 'menu rotationMax');
  assertUnit(menuVars.skew, 'deg', 'menu skew');
}

export const root = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 100,
  transform: transforms.value(
    transforms.translate3d(
      0,
      -(
        archVars.top.getValue() +
        archVars.curveHeight.getValue() +
        dropShadowVars.offsetY.getValue() +
        dropShadowVars.blur.getValue()
      ) * 1.5,
      0,
    ),
  ),
  transition: 'transform 0.8s cubic-bezier(0.69, 0.42, 0.01, 1) 0.3s',
  willChange: 'transform',
  backfaceVisibility: 'hidden',

  selectors: {
    '&[data-mounted="true"]': {
      transform: transforms.value(transforms.translate3d(0, 0, 0)),
    },
  },
});

export const contents = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  width: '100%',
  height: '100%',
  position: 'relative',
  zIndex: 1,
});

export const transitionAfterFonts = style({
  opacity: 0,
  transition: 'opacity 360ms ease-out',
});

globalStyle(
  `.${root}[data-mounted="true"] .${transitionAfterFonts}`,
  {
    opacity: 1,
  },
);
export const nav = style({
  display: 'flex',
  flexWrap: 'nowrap',
  width: '100%',
  height: archVars.top.css(),
  ...absolutePosition.topLeft(),
  position: 'absolute',
});

export const highlightLayer = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 0,
  contain: 'layout',
  isolation: 'isolate',
  overflow: 'visible',
});

export const miniBokehContainer = style({
  position: 'absolute',
  pointerEvents: 'none',
  opacity: 0,
  transition: 'opacity 1.5s ease-out',
  selectors: {
    '&[data-active="true"]': {
      opacity: 1,
    },
  },
});

const blobBase = style({
  position: 'absolute',
  borderRadius: '999px',
  pointerEvents: 'none',
  mixBlendMode: 'screen',
  transform: 'translate(-50%, -50%)',
  transition:
    'transform 320ms cubic-bezier(0.4, 0, 0.2, 1), opacity 320ms ease, width 320ms ease, height 320ms ease, filter 320ms ease, left 320ms cubic-bezier(0.4,0,0.2,1), top 320ms cubic-bezier(0.4,0,0.2,1)',
});

export const bokehBlobAlpha = style([
  blobBase,
]);
export const bokehBlobBeta = style([
  blobBase,
]);
export const bokehBlobGamma = style([
  blobBase,
]);

type BlobSlotConfig = {
  left: IMeasurement;
  top: IMeasurement;
  size?: IMeasurement;
  color: ColorWrapper;
  opacity?: number;
  blur?: IMeasurement;
  zIndex?: number;
  scale?: number;
};

type BlobName = 'alpha' | 'beta' | 'gamma';

const createBlobRule = (config: BlobSlotConfig): StyleRule => {
  const diameter = config.size ?? menuVars.blobDefaults.size;
  const opacity = config.opacity ?? menuVars.blobDefaults.opacity;
  const blur = config.blur ?? menuVars.blobDefaults.blur;
  const scale = config.scale ?? menuVars.blobDefaults.scale;
  const colorCss = config.color.alpha(opacity).css();
  return {
    left: config.left.css(),
    top: config.top.css(),
    width: diameter.css(),
    height: diameter.css(),
    background: colorCss,
    opacity,
    filter: `blur(${blur.css()})`,
    // boxShadow: `0 0 ${blur.round().css()} ${config.color
    // 	.alpha(Math.min(1, opacity * 1.15))
    // 	.css()}`,
    transform: `translate(-50%, -50%) scale(${scale})`,
  };
};

const slotConfigs: Array<Record<BlobName, BlobSlotConfig>> = [
  {
    alpha: {
      left: mPercent(26),
      top: mPercent(38),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.a,
      opacity: 0.6,
      blur: menuVars.blobDefaults.blur.multiply(1.45),
    },
    beta: {
      left: mPercent(58),
      top: mPercent(56),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.b,
      opacity: 0.52,
      blur: menuVars.blobDefaults.blur.multiply(1.35),
    },
    gamma: {
      left: mPercent(42),
      top: mPercent(70),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.d,
      opacity: 0.5,
      blur: menuVars.blobDefaults.blur.multiply(1.4),
    },
  },
  {
    alpha: {
      left: mPercent(32),
      top: mPercent(36),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.b,
      opacity: 0.58,
      blur: menuVars.blobDefaults.blur.multiply(1.5),
    },
    beta: {
      left: mPercent(66),
      top: mPercent(52),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.c,
      opacity: 0.5,
      blur: menuVars.blobDefaults.blur.multiply(1.3),
    },
    gamma: {
      left: mPercent(46),
      top: mPercent(74),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.d,
      opacity: 0.48,
      blur: menuVars.blobDefaults.blur.multiply(1.35),
    },
  },
  {
    alpha: {
      left: mPercent(22),
      top: mPercent(40),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.c,
      opacity: 0.56,
      blur: menuVars.blobDefaults.blur.multiply(1.45),
    },
    beta: {
      left: mPercent(60),
      top: mPercent(60),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.a,
      opacity: 0.54,
      blur: menuVars.blobDefaults.blur.multiply(1.4),
    },
    gamma: {
      left: mPercent(48),
      top: mPercent(76),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.d,
      opacity: 0.46,
      blur: menuVars.blobDefaults.blur.multiply(1.38),
    },
  },
  {
    alpha: {
      left: mPercent(28),
      top: mPercent(34),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.a,
      opacity: 0.6,
      blur: menuVars.blobDefaults.blur.multiply(1.3),
    },
    beta: {
      left: mPercent(64),
      top: mPercent(56),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.b,
      opacity: 0.5,
      blur: menuVars.blobDefaults.blur.multiply(1.35),
    },
    gamma: {
      left: mPercent(46),
      top: mPercent(68),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.c,
      opacity: 0.44,
      blur: menuVars.blobDefaults.blur.multiply(1.3),
    },
  },
  {
    alpha: {
      left: mPercent(24),
      top: mPercent(36),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.d,
      opacity: 0.58,
      blur: menuVars.blobDefaults.blur.multiply(1.4),
    },
    beta: {
      left: mPercent(60),
      top: mPercent(58),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.a,
      opacity: 0.52,
      blur: menuVars.blobDefaults.blur.multiply(1.32),
    },
    gamma: {
      left: mPercent(44),
      top: mPercent(74),
      size: menuVars.blobDefaults.size,
      color: themeColours.lights.b,
      opacity: 0.46,
      blur: menuVars.blobDefaults.blur.multiply(1.36),
    },
  },
];

export const bokehSlotAlphaClasses = slotConfigs.map((config) =>
  style(createBlobRule(config.alpha)),
);

export const bokehSlotBetaClasses = slotConfigs.map((config) =>
  style(createBlobRule(config.beta)),
);

export const bokehSlotGammaClasses = slotConfigs.map((config) =>
  style(createBlobRule(config.gamma)),
);

export const bokehTravelAlpha = style({
  opacity: 0.62,
  transform: 'translate(-50%, -50%) scale(0.96)',
});

export const bokehTravelBeta = style({
  opacity: 0.58,
  transform: 'translate(-50%, -50%) scale(0.95)',
});

export const bokehTravelGamma = style({
  opacity: 0.52,
  transform: 'translate(-50%, -50%) scale(0.94)',
});

export const bokehDebugBlob = style({
  outline: '1px dashed rgba(255,255,255,0.45)',
});

export const miniBokeh = style({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  borderRadius: '999px',
  mixBlendMode: 'screen',
  opacity: 0.5,
  transition:
    'width 350ms ease, height 350ms ease, transform 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease, background 420ms ease',
});

const focusScale = logoVars.focus?.scale ?? 1.05;
const hoverScale = focusScale * 1.05;
const maxLogoRotationDeg = 130;
const maxLogoRotationRad = (maxLogoRotationDeg * Math.PI) / 180;
const rotationScaleFactor =
  Math.abs(Math.cos(maxLogoRotationRad)) +
  Math.abs(Math.sin(maxLogoRotationRad));
const autoHitboxScale = hoverScale * rotationScaleFactor;
const focusTransition = logoVars.focus?.transitionMs ?? 260;

const logoHitboxSize = logoVars.width.multiply(autoHitboxScale);
const hitboxBuffer = m(6);
const logoHitboxDiameter = logoHitboxSize.add(hitboxBuffer);
const logoHitboxPadding = logoHitboxDiameter.divide(2);
const logoNavPaddingMeasurement = logoVars.width
  .divide(2)
  .add(hitboxBuffer);

const logoOutline = logoVars.hover?.outline;
const logoHoverOutlineWidth = logoOutline?.width ?? m(2);
const logoHoverOutlineOffset = logoOutline?.offset ?? m(6);
const logoHoverOutlineColor =
  logoOutline?.color ?? colorVars.contrast.alpha(0.6);

const logoHoverRotate = keyframes({
  '0%': {
    transform: transforms.value(
      transforms.rotate(0),
      transforms.scale(1),
    ),
  },
  '20%': {
    transform: transforms.value(
      transforms.rotate(-16),
      transforms.scale(1),
    ),
  },
  '40%': {
    transform: transforms.value(
      transforms.rotate(-16),
      transforms.scale(1),
    ),
  },
  '55%': {
    transform: transforms.value(
      transforms.rotate(138),
      transforms.scale(focusScale * 1.015),
    ),
  },
  '85%': {
    transform: transforms.value(
      transforms.rotate(118),
      transforms.scale(focusScale * 0.992),
    ),
  },
  '100%': {
    transform: transforms.value(
      transforms.rotate(120),
      transforms.scale(focusScale),
    ),
  },
});

const logoHoverExitDuration = 560;

const logoHoverRotateReverse = keyframes({
  '0%': {
    transform: transforms.value(
      transforms.rotate(120),
      transforms.scale(focusScale),
    ),
  },
  '40%': {
    transform: transforms.value(
      transforms.rotate(130),
      transforms.scale(focusScale * 1.05),
    ),
  },
  '74%': {
    transform: transforms.value(
      transforms.rotate(-10),
      transforms.scale(1),
    ),
  },
  '100%': {
    transform: transforms.value(
      transforms.rotate(0),
      transforms.scale(1),
    ),
  },
});

export const debugArch = style({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  fill: 'none',
  pointerEvents: 'none',
});

// One side
export const list = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  flexGrow: '1',
  width: '50%',
  // top: menuYOffset.css(),
  selectors: {
    '&[data-side="left"]': {
      justifyContent: 'flex-end',
      order: 0,
      ...paddings({
        right: logoNavPaddingMeasurement,
        left: logoNavPaddingMeasurement,
      }),
      transformOrigin: 'right center',
    },

    '&[data-side="right"]': {
      justifyContent: 'flex-start',
      order: 1,
      ...paddings({
        right: logoNavPaddingMeasurement,
        left: logoNavPaddingMeasurement,
      }),
      transformOrigin: 'left center',
    },
  },
});

export const item = style({
  flex: '0 0 auto',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
});

// Intentionally reorder so the logo is the first item visually but not in DOM
export const item_1 = style({
  // order: 0,
});
export const item_2 = style({
  // order: 0,
});

// Logo in the middle
export const logoItem = style({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  top: archVars.top.half().add(logoVars.offsetY).css(),
  left: '50%',
  zIndex: 1,
  transform: transforms.value(transforms.translate('-50%', '-50%')),
  width: logoHitboxPadding.multiply(2).css(),
  height: logoHitboxPadding.multiply(2).css(),
});

export const logoLink = style({
  ...flexPosition.center(),
  width: '100%',
  height: '100%',
  position: 'relative',
  cursor: 'pointer',
  selectors: {
    '&:focus-visible, &[data-debug-focus="true"]': outlines({
      width: logoHoverOutlineWidth,
      offset: logoHoverOutlineOffset,
      color: logoHoverOutlineColor,
    }),
    '&[data-at-top="true"]': {
      cursor: 'default',
    },
  },
});

export const logoClip = style({
  display: 'flex',
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  overflow: 'hidden',
  pointerEvents: 'none',
});

export const item_3 = style({
  order: 2,
});

export const item_4 = style({
  order: 2,
});

export const headerNavItem = style({
  ...absolutePosition.topRight(),
  order: 5,
});

export const link = style({
  textDecoration: 'none',
  borderRadius: 8,
  ...paddings({
    vertical: m(10),
    horizontal: m(20),
  }),
});

export const logoWrap = style({
  width: logoVars.width.css(),
  height: logoVars.width.css(),
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  transform: transforms.value(
    transforms.rotate(0),
    transforms.scale(1),
  ),
  clipPath: 'circle(50% at 50% 50%)',
  transformOrigin: 'center',
  transformBox: 'fill-box',
  transition: `transform ${focusTransition}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
  willChange: 'transform',
  selectors: {
    '[data-logo-anim="enter"] &': {
      animation: `${logoHoverRotate} 780ms cubic-bezier(0.5, 1.55, 0.35, 1) forwards`,
    },
    '[data-logo-anim="exit"] &': {
      animation: `${logoHoverRotateReverse} ${logoHoverExitDuration}ms cubic-bezier(0.45, 0, 0.2, 1) forwards`,
    },
    [`${logoLink}:focus-visible &, ${logoLink}[data-debug-focus="true"] &`]:
      {
        animation: 'none',
        transform: transforms.value(
          transforms.rotate(0),
          transforms.scale(focusScale),
        ),
      },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      selectors: {
        '[data-logo-anim="enter"] &': {
          animation: 'none',
          transform: transforms.value(
            transforms.rotate(0),
            transforms.scale(focusScale),
          ),
        },
        '[data-logo-anim="exit"] &': {
          animation: 'none',
          transform: transforms.value(
            transforms.rotate(0),
            transforms.scale(1),
          ),
        },
      },
    },
  },
});

export const logo = style({
  width: '100%',
  height: '100%',
  display: 'block',
  position: 'relative',
  zIndex: 1,
});
// used to calculate the position of the underline and the vertical offset to center it
// const linkOffset =

export const localeChanger = style({
  ...absolutePosition.topRight(
    0,
    menuVars.paddings.horizontal.half().css(),
  ),
  display: 'flex',
  alignContent: 'center',
  height: `${archVars.top.add(archVars.curveHeight).css()}`,
  ...composeFontVariantStyles(fontVariants.menu, {
    options: {
      weightPercents: {
        default: mPercent(50),
      },
    },
  }),
  lineHeight: 1,
  textDecoration: 'none',
  zIndex: 1,
  textShadow: `2px 2px 3px ${colorVars.navBg.css()}`,
  transform: transforms.value(
    transforms.skewX(menuVars.skew.multiply(-1.5)),
    transforms.rotate(2),
    transforms.translateY(-2),
  ),
});

export const localeLink = style({
  position: 'relative',
  top: menuVars.locale.offsetY.css(),
  color: menuVars.text.color.css(),
  alignSelf: 'center',
  transition: 'opacity 0.2s ease-in',
  opacity: menuVars.locale.opacity,
  display: 'inline-grid',
  gridTemplateAreas: 'stack',
  alignItems: 'center',
  transform: transforms.value(
    transforms.skewX(menuVars.rotationMax).negate(),
  ),
  selectors: {
    '&:hover, &:focus-visible': {
      opacity: 1,
      textShadow: `${menuVars.textShadow.offsetX.css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
      // menuVars.textShadow: `${menuVars.textShadow.offsetX.css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
    },
    '&:visited': {
      color: menuVars.text.color.css(),
    },
  },
});

export const navLink = style({
  position: 'relative',
  display: 'inline-grid',
  gridTemplateAreas: 'stack',
  alignItems: 'start',
  verticalAlign: 'baseline',
  ...paddings(menuVars.paddings),
  ...composeFontVariantStyles(fontVariants.menu, {
    options: {
      weightPercents: {
        default: mPercent(50),
      },
    },
  }),
  lineHeight: 1,
  textDecoration: 'none',
  letterSpacing: '0.5px',
  borderRadius: '50%',
  color: menuVars.text.color.css(),
  transition: 'all 0.45s ease',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 1.5px',
  textTransform: 'uppercase',
  backgroundPosition: `left 200% bottom 0, left 200% bottom 0.3em`,
  transformOrigin: '0 0',
  opacity: 0.7,
  selectors: {
    '&:hover': {
      opacity: 1,
    },
    '&[data-active="true"]': {
      // TODO
      // color: colorVars.contrast.css(),
      // transform: 'scale(1.2)',
      // letterSpacing: '0.1rem',
    },
    '&[aria-current="true"]': {
      pointerEvents: 'auto',
      cursor: 'pointer',
    },
    '&:visited': {
      color: menuVars.text.color.css(),
      // color: menuLinkVars.nav.color.css(),
    },
    '&:focus-visible, &[data-debug-focus="true"]': {
      outline: '2px solid currentColor',
      outlineOffset: 2,
      opacity: 1,
      // color: navLinkColor,
      // outline: '2px solid currentColor', outlineOffset: 2
      // color: colorVars.transparent.css(),
    },
  },
});

// For hover effects. we already have 2 inline transform styles on the link, this makes it easier to write the other in CSS
export const text = style({
  position: 'relative',
  transition: 'all 0.2s ease-in',
  gridArea: 'stack',
});

export const fakeShadow = style({
  ...absolutePosition.topLeft(),
  // Keep transparent, but we'll add mirrored text shadow
  color: colorVars.transparent.css(),
  gridArea: 'stack',
});

globalStyle(`.${navLink}[data-side="left"] .${fakeShadow}`, {
  textShadow: `${menuVars.textShadow.offsetX.css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
});

globalStyle(`.${navLink}[data-side="right"] .${fakeShadow}`, {
  textShadow: `${menuVars.textShadow.offsetX.negation().css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
});

globalStyle(`.${navLink}:hover .${fakeShadow}`, {
  filter: `blur(${menuVars.hover.shadow.blur.css()})`,
});

globalStyle(`.${navLink}[data-side="left"]:hover .${text}`, {
  transform: transforms.value(
    transforms.translate(
      menuVars.hover.text.offsetX.negation(),
      menuVars.hover.text.offsetY,
    ),
    transforms.scale(menuVars.hover.text.scale),
  ),
});

globalStyle(`.${navLink}[data-side="right"]:hover .${text}`, {
  transform: transforms.value(
    transforms.translate(
      menuVars.hover.text.offsetX,
      menuVars.hover.text.offsetY,
    ),
    transforms.scale(menuVars.hover.text.scale),
  ),
});

globalStyle(
  `.${localeLink}:hover .${text},
	.${localeLink}:focus-visible .${text}`,
  {
    transform: transforms.value(
      transforms.translate(
        menuVars.hover.text.offsetX,
        menuVars.hover.text.offsetY,
      ),
      transforms.scale(menuVars.hover.text.scale),
    ),
  },
);

globalStyle(`.${localeLink} .${fakeShadow}`, {
  textShadow: `${menuVars.textShadow.offsetX.negation().css()} ${menuVars.textShadow.offsetY.css()} ${menuVars.textShadow.blur.css()} ${menuVars.textShadow.color.css()}`,
});

// For subtle rotation on links
globalStyle(`.${list}[data-side="left"] .${navLink}`, {
  transformOrigin: 'right center',
});
globalStyle(`.${list}[data-side="right"] .${navLink}`, {
  transformOrigin: 'left center',
});
