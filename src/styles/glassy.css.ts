import { style } from '@vanilla-extract/css';
import {
  createGlassBackground,
  glassVars,
  transparentBorder,
} from './helpers/glossy';
import { colorVars } from './vars';
import { globalDropShadowFilter } from './helpers/shadow';
import { absolutePosition } from './helpers/positioning';

const glassBackground = createGlassBackground();
const defaultRadius = glassVars.cornerRadius.css();

const glassSurface = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  ...glassBackground,
});

export const bg = glassSurface;
export const navSurface = glassSurface;

export const frame = style({
  position: 'relative',
  borderRadius: defaultRadius,
  overflow: 'hidden',
});

export const surface = style([
  glassSurface,
  {
    borderRadius: defaultRadius,
  },
]);

export const rim = style({
  position: 'absolute',
  inset: 0,
  padding: glassVars.cornerSheen.ring.css(),
  borderRadius: defaultRadius,
  pointerEvents: 'none',
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude',
  background: `radial-gradient(circle at 0 0, ${colorVars.white
      .alpha(glassVars.cornerSheen.strength * 0.22)
      .css()} 0, ${colorVars.white.alpha(0).css()} ${glassVars.cornerSheen.size.css()}),
    conic-gradient(from -90deg at 0 0, transparent 0deg, ${colorVars.white
      .alpha(glassVars.cornerSheen.strength * 0.8)
      .css()} 0deg, ${colorVars.white
      .alpha(glassVars.cornerSheen.strength * 0.6)
      .css()} ${glassVars.cornerSheen.angle.css()}, transparent ${glassVars.cornerSheen.angle.css()})`,
  mixBlendMode: 'screen',
  filter: 'blur(0.35px)',
  opacity: glassVars.cornerSheen.strength + 0.12,
});

export const element = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  borderRadius: defaultRadius,
});

export const grain = style({
  ...absolutePosition.fullSize(),
  inset: 0,
  pointerEvents: 'none',
  borderRadius: defaultRadius,
  backgroundImage: glassVars.noiseDataUri,
  backgroundRepeat: 'repeat',
  backgroundSize: '240px 240px',
  mixBlendMode: 'overlay',
  opacity: '0.03',
});

export const stroke = style({
  transform: `translateY(${transparentBorder.thickness.multiply(-0.25).css()})`,
});

export const shadow = style({
  filter: globalDropShadowFilter(),
});
