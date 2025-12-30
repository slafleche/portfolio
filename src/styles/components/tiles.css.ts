import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';
import { paddings, margins } from '../helpers/spacing.helper';
import { borders } from '../helpers/borders.helper';
import { colorVars, borderVars } from '../../tokens/global.tokens';
import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '24px',
});

export const tile = style({
  position: 'relative',
  backgroundColor: colorVars.bodyBg.alpha(0.9).css(),
  ...borders.radii(borderVars),
  ...paddings(m(24)),
});

export const tileTitle = style({
  ...margins({
    bottom: m(8),
  }),
  ...fontStylesFromFontVariant(typographyFontVariants.h3),
});
