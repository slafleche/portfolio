import { color } from './colorWrap.helper';
import type * as CSS from 'csstype';
import { m } from '../measurementKit';
import { colorVars } from '../componentTokens/global.componentTokens';
import { archTokens } from '../../tokens/arch.tokens';

export const createArchGlassBackground = (): {
  background: CSS.Property.Background<string>;
  backdropFilter: CSS.Property.BackdropFilter;
  WebkitBackdropFilter: CSS.Property.BackdropFilter;
} => {
  // Ensure a tiny alpha so Safari renders backdrop-filter
  const baseAlpha = archTokens.backgroundColor.value().alpha(); // getter -> number
  const ensuredBg = archTokens.backgroundColor.alpha(
    Math.max(baseAlpha || 0, 0.01),
  );

  const overlay = `linear-gradient(${archTokens.overlay.direction.css()}, ${archTokens.overlay.color
    .alpha(archTokens.overlay.topAlpha)
    .css()} 0%, ${archTokens.overlay.color.alpha(0).css()} ${
    archTokens.overlay.midStop
  }, ${archTokens.overlay.color.alpha(archTokens.overlay.bottomAlpha).css()} 100%)`;

  const glow = `linear-gradient(180deg, ${archTokens.surfaceGlowPrimaryTint.css()}, ${archTokens.surfaceGlowSecondaryTint.css()})`;

  return {
    background: [
      overlay,
      glow,
      ensuredBg.css(),
    ].join(', '),
    backdropFilter: `blur(${archTokens.backdropBlur.css()})`,
    WebkitBackdropFilter:
      `blur(${archTokens.backdropBlur.css()})` as CSS.Property.BackdropFilter,
  };
};
