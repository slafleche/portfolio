import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { glassVars } from '../../tokens/glassy.tokens';
import { colorVars } from '../../tokens/global.tokens';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { wordMarkVars } from '../../tokens/wordmarks.tokens';
import { cardLayout } from '../componentTokens/card.component.tokens';
import borders from '../helpers/borders.helper';
import { makeCardGradient } from '../helpers/cardGradient.helper';
import { makeGlassSurface } from '../helpers/glassy.helper';
import { absolutePosition } from '../helpers/positioning.helper';
import { globalDropShadowFilter } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import wordMarkMeta from '../helpers/wordmark.helper';
import {
  componentMediaQueries,
  globalComponentMediaQueryStyle,
  mediaQueryStyle,
} from '../responsive/mediaQueries';

export const root = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minHeight: cardLayout.logoBox.minWidth.css(),
  selectors: {
    '&[data-type="left"]': {
      gridColumn: '1',
    },
    '&[data-type="right"]': {
      gridColumn: '3',
    },
    ...mediaQueryStyle({
      compact: {
        minHeight: 0,
      },
    }),
  },
});

globalStyle(`.${root}[data-type="right"] *`, {
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
});

globalStyle(`.${root}[data-type="left"] *`, {
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
});

export const container = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gap: cardLayout.grid.gap.css(),
  alignItems: 'stretch',
});

export const frame = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  backgroundColor: colorVars.transparent.css(),
  height: '100%',
  selectors: {
    ...componentMediaQueries({
      card_oneColumn: {
        flexDirection: 'column',
      },
    }),
  },
});

export const logoBox = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...paddings(cardLayout.logoBox.paddings),
  minWidth: cardLayout.logoBox.minWidth.css(),
  selectors: {
    ...componentMediaQueries({
      card_oneColumn: {
        position: 'absolute',
        top: '0%',
        left: '50%',
        transform: `translate(-50%, ${wordMarkVars.compact.offset.css()})`,
        display: 'inline-flex',
        minWidth: 0,
        zIndex: 1,
        ...borders.radii(m(10)),
        overflow: 'hidden',
        ...paddings(cardLayout.logoBox.mobile.paddings),
        filter: globalDropShadowFilter({
          blur: m(4),
        }),
      },
    }),
  },
});

export const content = style({
  position: 'relative',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

export const panel = style({
  position: 'relative',
  flex: 1,
  display: 'flex',
  height: '100%',
  selectors: {
    ...componentMediaQueries({
      card_oneColumn: {
        flexDirection: 'column',
      },
    }),
  },
});

// export const panelSurface = style({
//   flex: 1,
//   display: 'flex',
//   flexDirection: 'column',
//   height: '100%',
// });

// export const panelContent = style({
//   flex: 1,
//   display: 'flex',
//   flexDirection: 'column',
//   height: '100%',
// });

export const glassSurface = style(
  makeGlassSurface({
    blur: m(3),
  }),
);

export const title = style({});
export const text = style({
  ...paddings(m(40)),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...paddings(anchorMenuVars.handle.sizeWithBorder),
      },
    }),
  },
});

export const gradient = style({
  ...absolutePosition.fullSize(),
  pointerEvents: 'none',
  zIndex: 0,
});

export const spacer = style({
  display: 'none',
  width: '100%',
  pointerEvents: 'none',
  selectors: {
    ...componentMediaQueries({
      card_oneColumn: {
        display: 'block',
      },
    }),
  },
});

export const cardCC = style({
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      marginTop: wordMarkMeta.cc.spacing.north.css(),
    },
  }),
});
export const cardEa = style({
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      marginTop: wordMarkMeta.ea.spacing.north.css(),
    },
  }),
});
export const cardBanq = style({
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      marginTop: wordMarkMeta.banq.spacing.north.css(),
    },
  }),
});
export const cardHs = style({
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      marginTop: wordMarkMeta.hs.spacing.north.css(),
    },
  }),
});
export const cardKg = style({
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      marginTop: wordMarkMeta.kg.spacing.north.css(),
    },
  }),
});

export const gradientCC = style({
  ...makeCardGradient(wordMarkVars.cc.gradients.colors, {
    linearDirection: wordMarkVars.cc.gradients.direction,
  }),
});
export const gradientEa = style({
  ...makeCardGradient(wordMarkVars.ea.gradients.colors, {
    linearDirection: wordMarkVars.ea.gradients.direction,
  }),
});

export const gradientBanq = style({
  ...makeCardGradient(wordMarkVars.banq.gradients.colors, {
    linearDirection: wordMarkVars.banq.gradients.direction,
  }),
});

export const gradientHs = style({
  ...makeCardGradient(wordMarkVars.hs.gradients.colors, {
    linearDirection: wordMarkVars.hs.gradients.direction,
  }),
});

export const gradientKg = style({
  ...makeCardGradient(wordMarkVars.kg.gradients.colors, {
    linearDirection: wordMarkVars.kg.gradients.direction,
  }),
});

export const wordmarkTextNoLogo = style({
  selectors: {
    '&[data-position="before"]': {
      ...margins({
        left: m(0.5, 'em'),
      }),
    },
    '&[data-position="after"]': {
      ...margins({
        right: m(0.5, 'em'),
      }),
    },
  },
});

const caseStudyLogoHeight = m(1.4, 'em');

export const wordMark_vanilla = style({
  display: 'inline-block',
  height: caseStudyLogoHeight.css(),
  transform: `translateY(${caseStudyLogoHeight.divide(9).round(3).css()})`,
  width: 'auto',
  verticalAlign: 'baseline',
});

export const wordMark_cc = style({
  width: wordMarkVars.cc.size.css(),
  height: wordMarkVars.cc.size.css(),
});

globalStyle(`.${cardCC} .${spacer}`, {
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      height: wordMarkMeta.cc.spacing.south.css(),
    },
  }),
});

export const wordMark_ea = style({
  width: wordMarkVars.ea.size.css(),
  height: 'auto',
});

globalStyle(`.${cardEa} .${spacer}`, {
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      height: wordMarkMeta.ea.spacing.south.css(),
    },
  }),
});

export const wordMark_banq = style({
  width: wordMarkVars.banq.size.css(),
  height: 'auto',
});

globalStyle(`.${cardBanq} .${spacer}`, {
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      height: wordMarkMeta.banq.spacing.south.css(),
    },
  }),
});

export const wordMark_hs = style({
  width: wordMarkVars.hs.size.css(),
  height: 'auto',
});

globalStyle(`.${cardHs} .${spacer}`, {
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      height: wordMarkMeta.hs.spacing.south.css(),
    },
  }),
});

export const wordMark_kg = style({
  width: wordMarkVars.kg.size.css(),
  height: 'auto',
});

globalStyle(`.${cardKg} .${spacer}`, {
  ...globalComponentMediaQueryStyle({
    card_oneColumn: {
      height: wordMarkMeta.kg.spacing.south.css(),
    },
  }),
});

export const logoAsBg = style({
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'hidden',
  filter: 'blur(1px)',
});

export const logoAsBgSVG = style({
  position: 'absolute',
  top: '50%',
  left: glassVars.backdropFilter.blur.add(m(5)).css(),
  transformOrigin: '0 100%',
  width: '100%',
  height: 'auto',
  mixBlendMode: 'multiply',
  ...paddings({
    horizontal: m(8),
  }),
});

export const logoAsBg_cc = style({
  width: '110%',
  color: wordMarkVars.cc.logoAsBg.css(),
  transform: 'translate(0, -60%) rotate(4deg)',
});

export const logoAsBg_ea = style({
  width: '100%',
  transform: 'translate(0%, -50%) rotate(4deg)',
  color: wordMarkVars.ea.logoAsBg.css(),
});

export const logoAsBg_banq = style({
  width: '100%',
  transformOrigin: '50% 50%',
  transform: 'translate(20%, -50%) rotate(4deg) scale(1.5)',
  color: wordMarkVars.banq.logoAsBg.css(),
});

export const logoAsBg_hs = style({
  width: '100%',
  transformOrigin: '50% 50%',
  transform: 'translate(4%, -60%) rotate(6deg) scale(1.3)',
  color: wordMarkVars.hs.logoAsBg.css(),
});

export const logoAsBg_kg = style({
  width: '90%',
  transformOrigin: '50% 50%',
  transform: 'translate(5%, -64%) rotate(-3deg) scale(1.1)',
  color: wordMarkVars.kg.logoAsBg.css(),
});
