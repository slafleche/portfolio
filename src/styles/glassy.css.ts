import { style } from '@vanilla-extract/css';
import { glassVars } from './helpers/effects';
import * as csstype from 'csstype';

export const glassyBg = style({
  position: 'relative',
  background: [
    `linear-gradient(135deg, ${glassVars.tint1}, ${glassVars.tint2})`,
    glassVars.bg,
  ].join(', '),
  boxShadow: glassVars.shadow,
  backdropFilter: `blur(${glassVars.blur})`,
  WebkitBackdropFilter:
    `blur(${glassVars.blur})` as csstype.Property.BackdropFilter,
  outline: '1px solid hsla(0 0% 100% / 0.06)',

  selectors: {
    '&::before': {
      content: '',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      opacity: glassVars.noiseOpacity as csstype.Property.Opacity,
      mixBlendMode: 'overlay',
      backgroundImage: glassVars.noiseDataUri,
      backgroundSize: '180px 180px',
    },
    '&::after': {
      content: '',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      padding: '1px',
      boxSizing: 'border-box',
      background: [
        `radial-gradient(120% 120% at 0% 0%, hsla(0 0% 100% / 0.28), transparent 60%)`,
        `radial-gradient(120% 120% at 100% 0%, hsla(0 0% 100% / 0.16), transparent 60%)`,
        `linear-gradient(180deg, ${glassVars.innerRim}, transparent 70%)`,
      ].join(', '),
      border: '1px solid hsla(0 0% 100% / 0.10)',
      opacity: '0.9',

      // Mask: make a rim by punching out the center
      // TS doesn’t know vendor/modern mask props — cast to any.

      WebkitMask:
        'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)' as csstype.Property.WebkitMask,

      WebkitMaskComposite: 'xor' as csstype.Property.WebkitMaskComposite,

      maskComposite: 'exclude' as csstype.Property.MaskComposite,
      // Standard mask for non-WebKit

      mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)' as csstype.Property.Mask,
    },

    '&:hover': {
      transform: 'translateY(-1px)',
      transition:
        'transform 160ms ease, backdrop-filter 160ms ease, -webkit-backdrop-filter 160ms ease',
      backdropFilter: `blur(calc(${glassVars.blur} * 1.15))`,
      WebkitBackdropFilter:
        `blur(calc(${glassVars.blur} * 1.15))` as csstype.Property.BackdropFilter,
    },
  },
});
