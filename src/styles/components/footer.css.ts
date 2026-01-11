import type { ComplexStyleRule } from '@vanilla-extract/css';
import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { layoutVars } from '../../tokens/layout.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import {
  footerGradientConfig,
  footerVars,
} from '../componentTokens/footer.component.tokens';
import { curlVars } from '../componentTokens/pageCurl.component.tokens';
import backdropFilters from '../helpers/backdropFilter.helper';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import {
  componentMediaQueries,
  mediaQueryStyle,
} from '../responsive/mediaQueries';

export const root = style({
  position: 'relative',
  ...gradientAsBgImg(buildLinear(footerGradientConfig)),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  rowGap: '32px',
  color: '#ffffff',
  width: '100%',
  textAlign: 'center',
  overflow: 'hidden',
  minHeight: curlVars.height.css(),
  ...paddings({
    vertical: layoutVars.content.gap.multiply(1.5).round(),
  }),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...paddings({
          top: anchorMenuVars.handle.sizeWithBorder.multiply(2),
          bottom: anchorMenuVars.handle.sizeWithBorder.multiply(1.5),
        }),
      },
    }),
  },
});

export const heading = style({
  position: 'relative',
  zIndex: 1,
  fontSize: '48px',
  fontWeight: 700,
  margin: 0,
});

export const content = style({
  position: 'relative',
  zIndex: 1,
  lineHeight: 1,
  textAlign: 'center',
  fontSize: '28px',
  margin: 'auto',
  opacity: 0.9,
  ...paddings({
    bottom: m(0.5, 'em'),
  }),
});

export const links = style({
  position: 'relative',
  zIndex: 1,
  pointerEvents: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: footerVars.glassyLinks.gap.css(),
  ...margins({
    top: m(24),
  }),
  padding: 0,
  listStyle: 'none',
  selectors: {
    ...componentMediaQueries({
      footer_oneColumn: {
        flexDirection: 'column',
      },
    }),
  },
});

globalStyle(`${links} > *`, {
  pointerEvents: 'auto',
});


const iconBase: ComplexStyleRule = {
  width: '36px',
  height: '36px',
  display: 'block',
  opacity: 0.85,
  position: 'relative',
  zIndex: 1,
};

export const contactIcon = style(iconBase);
export const linkedInIcon = style(iconBase);
export const gitHubIcon = style(iconBase);
