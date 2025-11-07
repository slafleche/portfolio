import { style } from '@vanilla-extract/css';
import { glassVars } from '../../tokens/glassy.tokens';
import { boxShadow } from './shadow';
import { colorVars } from '../componentTokens/componentTokens.global';
import { borders } from './borders';
import { paddings } from './spacing';

export const frame = style({
  // position: 'relative',
  ...borders(glassVars.borders, { allowRadiusOnly: true }),
  // overflow: 'hidden',
  boxShadow: boxShadow(),
});

export const surfaceBorder = style({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  ...paddings(glassVars.borders.width),
  ...borders(glassVars.borders, { allowRadiusOnly: true }),
  pointerEvents: 'none',
  WebkitMask:
    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude',
  background: [
    `radial-gradient(circle at 0 0, ${glassVars.innerBorderColor
      .alpha(glassVars.innerBorderHighlight.radialStrength)
      .css()} 0, ${colorVars.transparent.css()} ${glassVars.outerBorderHighlight.spread.css()})`,
    `conic-gradient(from -90deg at 0 0, transparent 0deg, ${glassVars.innerBorderColor.css()} 0deg, ${glassVars.innerBorderColor.css()} ${glassVars.outerBorderHighlight.angle.css()}, transparent ${glassVars.outerBorderHighlight.angle.css()})`,
  ].join(', '),
  mixBlendMode: 'screen',
  opacity: glassVars.innerBorderHighlight.opacity,
  zIndex: 1,
});

export const rim = style({
  position: 'absolute',
  inset: 0,
  ...paddings(glassVars.borders.width),
  ...borders(glassVars.borders, { allowRadiusOnly: true }),
  pointerEvents: 'none',
  WebkitMask:
    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude',
  background: `radial-gradient(circle at 0 0, ${glassVars.innerBorderColor
    .alpha(glassVars.outerBorderHighlight.strength * 0.22)
    .css()} 0, ${glassVars.innerBorderColor.alpha(0).css()} ${glassVars.outerBorderHighlight.spread.css()}),
   conic-gradient(from -90deg at 0 0, transparent 0deg, ${glassVars.innerBorderColor
     .alpha(glassVars.outerBorderHighlight.strength * 0.8)
     .css()} 0deg, ${glassVars.innerBorderColor
     .alpha(glassVars.outerBorderHighlight.strength * 0.6)
     .css()} ${glassVars.outerBorderHighlight.angle.css()}, transparent ${glassVars.outerBorderHighlight.angle.css()})`,
  mixBlendMode: 'screen',
  filter: 'blur(0.35px)',
  opacity: glassVars.outerBorderHighlight.strength + 0.12,
  zIndex: 5,
});
