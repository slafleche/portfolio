import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { typographyFontVariants } from '../../tokens/fontVariants/typography';
import { borderVars } from '../../tokens/global.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { borders } from '../helpers/borders.helper';
import { fontStylesFromFontVariant } from '../helpers/fontVariant.helper';
import { margins,paddings } from '../helpers/spacing.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '24px',
  alignItems: 'stretch',
  selectors: {
    ...mediaQueryStyle({
      snug: {
        gridTemplateColumns: '1fr',
      },
    }),
  },
});

export const intro = style({
  textAlign: 'center',
  selectors: {
    ...mediaQueryStyle({
      snug: {
        ...paddings({
          horizontal: anchorMenuVars.handle.sizeWithBorder,
        }),
      },
    }),
  },
});

export const tile = style({
  position: 'relative',
  height: '100%',
  // backgroundColor: colorVars.bodyBg.alpha(0.9).css(),
  ...borders.radii(borderVars),
  ...paddings(m(36)),
  selectors: {
    ...mediaQueryStyle({
      snug: {
        ...paddings({
          vertical: m(36),
          horizontal: anchorMenuVars.handle.sizeWithBorder,
        }),
      },
    }),
  },
});

export const tilePanel = style({
  display: 'block',
  height: '100%',
});

export const tilePanelSurface = style({
  height: '100%',
});

export const title = style({
  ...margins({
    bottom: m(1, 'em'),
  }),
  ...fontStylesFromFontVariant({
    variant: typographyFontVariants.h3,
    baseVariant: typographyFontVariants.heading,
  }),
});
