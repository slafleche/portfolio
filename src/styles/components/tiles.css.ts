import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';
import { paddings, margins } from '../helpers/spacing.helper';
import { borders } from '../helpers/borders.helper';
import { borderVars } from '../../tokens/global.tokens';
import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '24px',
  alignItems: 'stretch',
});

export const tile = style({
  position: 'relative',
  height: '100%',
  // backgroundColor: colorVars.bodyBg.alpha(0.9).css(),
  ...borders.radii(borderVars),
  ...paddings(m(24)),
});

export const tilePanel = style({
  display: 'block',
  height: '100%',
});

export const tilePanelSurface = style({
  height: '100%',
});

export const tileTitle = style({
  ...margins({
    bottom: m(8),
  }),
  ...fontStylesFromFontVariant(typographyFontVariants.h3),
});
