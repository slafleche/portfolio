import { globalStyle, style } from '@vanilla-extract/css';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
import { m, mPercent } from 'css-calipers';
import { absolutePosition } from '../helpers/positioning.helper';
import { curlVars } from '../componentTokens/pageCurl.component.tokens';
import {
  buildRadial,
  gradientAsBgImg,
  maskByLinearGradient,
} from '../helpers/gradients.helper';
import { color } from '../helpers/colorWrap.helper';
import { colorVars, themeColours } from '../../tokens/global.tokens';

// Match gradient in footer
// const surfaceGradient = buildLinear(pageCurlGradientConfig);
const bgMatch = themeColours.gradients.main.end;
const bgContrast = themeColours.gradients.main.start;

const pageInsideColor = themeColours.purples.wine;
const pageEdgeColor = bgContrast.lighten(0.2);
const pageEdgeThickness = m(2);

export const root = style({
  ...absolutePosition.bottomLeft(),
  display: 'block',
  maxWidth: '100%',
  maxHeight: '100%',
  width: curlVars.width.css(),
  height: curlVars.height.css(),
  overflow: 'hidden',
});

export const link = style({
  display: 'block',
  ...absolutePosition.bottomLeft(),
  width: curlVars.open.width.css(),
  height: curlVars.open.height.css(),
  color: 'inherit',
  textDecoration: 'none',
  overflow: 'visible',
});

const transitionGradient = buildRadial({
  at: '0% 100%',
  shape: 'circle',
  stops: [
    {
      color: bgMatch,
      at: mPercent(0),
    },
    {
      color: bgMatch.alpha(0),
      at: mPercent(65),
    },
  ],
});

export const box = style({
  ...absolutePosition.fullSize(),
  ...gradientAsBgImg(transitionGradient),
});

export const cornerBox = style({
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: curlVars.closed.width.css(),
  height: curlVars.closed.height.css(),
  overflow: 'visible',
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const pageTip = style({
  position: 'absolute',
  inset: 0,
  ...backgrounds({
    image: `linear-gradient(225deg,  
    ${pageInsideColor.darken(0.1).css()} 20%, 
    ${pageInsideColor.darken(0.05).css()} 30%, 
    ${pageInsideColor.darken(0.1).css()} 40%, 
    ${pageInsideColor.darken(0.4).css()} 50% 
  )`,
  }),
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const pageTipBorder = style({
  position: 'absolute',
  top: 0,
  right: 0,
  transform: `translate(${pageEdgeThickness.css()}, -${pageEdgeThickness.css()})`,
  width: '70%',
  height: '70%',
  pointerEvents: 'none',
  ...borders({
    top: {
      color: pageEdgeColor,
      width: pageEdgeThickness,
    },
    right: {
      color: pageEdgeColor,
      width: pageEdgeThickness,
    },
  }),
});

const maskPosition = mPercent(57.5);
const mask = maskByLinearGradient({
  angle: m(225, 'deg'),
  stops: [
    {
      color: color('#000').alpha(0),
      at: maskPosition,
    },
    {
      color: color('#000').alpha(1),
      at: maskPosition,
    },
  ],
});

const pageCurlRadius = mPercent(18);
// const cornerPosition = 0.575;
const mainAngle = m(225, 'deg');

export const cornerContents = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  backgroundColor: bgContrast.css(),
  width: '125%',
  height: '125%',
  overflow: 'hidden',
  ...mask,
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const fakeShadow = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '50%',
  height: '150%',
  transform: `rotate(-45deg) translate(85%, 0%)`,
  ...backgrounds({
    color: colorVars.shadow.alpha(1),
  }),
  filter: 'blur(8px)',
});

// export const cornerBase = style({
//   position: 'absolute',
//   bottom: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
// });

export const cornerHighlight = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '133%',
  height: '133%',
  ...backgrounds({
    image: `linear-gradient(${mainAngle.css()}, rgba(255,255,255,0) 37%, #ddd 62%, rgba(230,230,230,0.1) 64%, rgba(255,255,255,0) 67%), radial-gradient(circle at 150% -150%, transparent 74%, rgba(0,0,0,0.2) 74%, transparent 81%)`,
  }),
});

export const cornerButtonLabel = style({
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
});

export const bottomRightSlope = style({
  position: 'absolute',
  left: '100%',
  bottom: 0,
  width: '50%',
  height: '50%',
  ...borders({
    left: {
      width: pageEdgeThickness,
      color: pageEdgeColor,
    },
    radius: {
      nw: m(0),
      sw: pageCurlRadius,
    },
  }),
  ...backgrounds({
    // color: themeColours.gradients.main.start,
    image: `linear-gradient(45deg, rgba(255,255,255,0), rgba(255,255,255,0)), radial-gradient(circle at 180% -200%, rgba(255,255,255,0) 80%, rgba(0,0,0,0.2) 100%)`,
  }),
  zIndex: 2,
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const topLeftSlope = style({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  width: '50%',
  height: '50%',
  ...borders({
    bottom: {
      width: pageEdgeThickness,
      color: pageEdgeColor,
    },
    radius: {
      se: m(0),
      sw: pageCurlRadius,
    },
  }),
  // ...borders.radii({
  //   radius: {
  //     sw: pageCurlRadius,
  //   },
  // }),
  ...backgrounds({
    image: `linear-gradient(45deg, rgba(255,255,255,0), rgba(255,255,255,0)), radial-gradient(circle at 180% -200%, rgba(255,255,255,0) 80%, rgba(0,0,0,0.2) 100%)`,
  }),
  zIndex: 2,
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

// Hover interactions: grow the corner and accent the curl when the box is hovered
globalStyle(`.${link}:hover .${cornerBox}`, {
  // globalStyle(`.${root} .${cornerBox}`, {
  width: curlVars.open.width.css(),
  height: curlVars.open.height.css(),
});

// globalStyle(`.${link}:hover .${bottomRightSlope}`, {
//   // globalStyle(`.${root} .${bottomRightSlope}`, {
//   ...borders(
//     {
//       left: {
//         width: pageEdgeThickness,
//         color: pageEdgeColor,
//       },
//     },
//     { skipDefaults: true },
//   ),
// });

// globalStyle(`.${link}:hover .${topLeftSlope}`, {
//   // globalStyle(`.${root} .${topLeftSlope}`, {
//   ...borders(
//     {
//       right: {
//         width: pageEdgeThickness,
//         color: pageEdgeColor,
//       },
//     },
//     { skipDefaults: true },
//   ),
// });
