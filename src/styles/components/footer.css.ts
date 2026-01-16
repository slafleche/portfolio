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
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import {
  componentMediaQueries,
  mediaQueryStyle,
} from '../responsive/mediaQueries';
import { glassLink } from './glassyButtons.css';

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
  overflow: 'visible',
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

export const anchorSentinel = style({
  ...absolutePosition.bottomLeft(m(0), m(0)),
  width: '1px',
  height: '1px',
  pointerEvents: 'none',
  visibility: 'hidden',
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

export const link = style({
  zIndex: 1,
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

export const icon = style({
  transition: `transform 0.3s ease-out 0.1s`,
});

globalStyle(`.${glassLink}:hover .${icon}`, {
  transform: `scale(1.2)`,
});
