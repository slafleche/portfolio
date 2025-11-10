import { archGlassVars } from '../../tokens/arch.tokens';
import type { BackdropFilterIntent } from './backdropFilter.helper';
import type { CSS_TYPES } from './types.helper';

export const createArchGlassBackground = (): {
  background: CSS_TYPES.Property.Background<string>;
  filterIntent: BackdropFilterIntent;
} => {
  // Ensure a tiny alpha so Safari renders backdrop-filter
  const baseAlpha = archGlassVars.backgroundColor.value().alpha(); // getter -> number
  const ensuredBg = archGlassVars.backgroundColor.alpha(
    Math.max(baseAlpha || 0, 0.01),
  );

  const overlay = `linear-gradient(${archGlassVars.overlay.direction.css()}, ${archGlassVars.overlay.color
    .alpha(archGlassVars.overlay.topAlpha)
    .css()} 0%, ${archGlassVars.overlay.color.alpha(0).css()} ${
    archGlassVars.overlay.midStop
  }, ${archGlassVars.overlay.color.alpha(archGlassVars.overlay.bottomAlpha).css()} 100%)`;

  const glow = `linear-gradient(180deg, ${archGlassVars.surfaceGlowPrimaryTint.css()}, ${archGlassVars.surfaceGlowSecondaryTint.css()})`;

  return {
    background: [
      overlay,
      glow,
      ensuredBg.css(),
    ].join(', '),
    filterIntent: {
      blur: archGlassVars.backdropBlur,
    },
  };
};
