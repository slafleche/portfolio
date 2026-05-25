import { globalStyle, style } from '@vanilla-extract/css';
import { m, mEm } from 'css-calipers';

import { colorVars } from '../../tokens/global.tokens';
import { layoutVars } from '../../tokens/layout.tokens';
import {
  heroGradient,
  heroVars,
} from '../componentTokens/hero.component.tokens';
import { makeCardGradient } from '../helpers/cardGradient.helper';
import { makeGlassSurface } from '../helpers/glassy.helper';
import {
  buildLinear,
  gradientAsBgImg,
} from '../helpers/gradients.helper';
import { fullSizeOfParent } from '../helpers/positioning.helper';
import { textShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import {
  globalMediaQueryStyle,
  mediaQueryStyle,
} from '../responsive/mediaQueries';

/* ============================================================================
   ROOT + MEDIA + OVERLAYS
   ========================================================================== */

const bgGradients = buildLinear({
  stops: heroVars.background.linear,
});

export const root = style({
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  width: '100%',
  minHeight: [
    '100vh',
    '100dvh',
  ],
  overflow: 'hidden',
  isolation: 'isolate',
  selectors: {
    ...mediaQueryStyle({
      compact: {
        minHeight: 0,
      },
    }),
  },
});

export const image = style({
  ...fullSizeOfParent(),
  zIndex: 0,
  pointerEvents: 'none',
});

globalStyle(`.${image} img`, {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const contentWrap = style({
  ...fullSizeOfParent(),
  ...gradientAsBgImg(bgGradients),
});

export const visualContent = style({
  ...fullSizeOfParent(),
  position: 'relative',
  opacity: heroVars.background.videoOpacity,
});

export const overlays = style({
  ...fullSizeOfParent(),
  zIndex: 1,
  pointerEvents: 'none',
  position: 'absolute',
  inset: 0,
});

export const glassySurfaceOverwrite = style({
  ...makeGlassSurface({
    blur: m(15),
  }),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: [
          '100vh',
          '100dvh',
        ],
      },
    }),
  },
});

export const fullGradient = style({
  ...fullSizeOfParent(),
  position: 'relative',
  pointerEvents: 'none',
  ...makeCardGradient(heroGradient, {
    linearDirection: m(145, 'deg'),
  }),
});

/* ============================================================================
   CONTENT / PANELS
   ========================================================================== */

export const content = style({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: '100%',
      },
    }),
  },
});

export const main = style({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  ...margins({
    bottom: 0,
  }),
  ...paddings({
    vertical: m(100),
  }),
  selectors: {
    '&&': {
      bottom: 0,
    },
  },
});

// Opt-in extension class for the blog-image debug preview. Applied
// alongside `main` via the Hero's `mainClassName` prop, never on the
// production hero.
export const blogMain = style({});

export const subtitle = style({
  opacity: 0,
  textAlign: 'center',
  fontSize: '22px',
  lineHeight: 1.3,
  maxWidth: '1000px',
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(0),
    color: colorVars.black,
  }),
  ...margins({
    top: mEm(1),
  }),
  selectors: {
    '&[data-ready="true"]': {
      opacity: 1,
    },
    ...mediaQueryStyle({
      compressed: {
        fontSize: '1rem',
      },
    }),
  },
});

globalStyle(`.${subtitle} br`, {
  ...globalMediaQueryStyle({
    snug: {
      display: 'none',
    },
  }),
});

export const titleAsSvg = style({
  display: 'block',
  width: '100%',
  height: 'auto',
});

export const subtitleMarkdown = style({});

globalStyle(`.${subtitleMarkdown} p`, {
  fontSize: '22px',
  margin: 0,
});

export const panel = style({
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  alignSelf: 'stretch',
  ...margins({
    horizontal: 'auto',
  }),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: '100%',
      },
    }),
  },
});

export const glassPanel = style({
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: '100%',
      },
    }),
  },
});

export const glassWrap = style({
  width: '100%',
  position: 'relative',
  zIndex: 1,
  selectors: {
    ...mediaQueryStyle({
      compact: {
        height: '100%',
      },
    }),
  },
});

export const container = style({
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  isolation: 'isolate',
  overflow: 'visible',
  textAlign: 'center',
  maxWidth: '100%',
  width: `clamp(0px, max(70vw, 100vh), ${layoutVars.content.width.css()})`,
});
