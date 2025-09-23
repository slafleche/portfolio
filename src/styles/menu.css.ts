import { style } from '@vanilla-extract/css';
import { absolutePosition, flexPosition } from './helpers/positioning';
import { archVars, colorVars, dropShadowVars, logoVars } from './vars';

export const menu = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 100,
  transform: `translate3d(0, -${
    (archVars.top +
      archVars.curveHeight +
      dropShadowVars.offsetY.value +
      dropShadowVars.blur.value) *
    1.5
  }px, 0)`,
  transition: 'transform 0.8s cubic-bezier(0.69, 0.42, 0.01, 1) 0.3s',
  willChange: 'transform',
  backfaceVisibility: 'hidden',

  selectors: {
    '&[data-mounted="true"]': {
      transform: 'translate3d(0, 0, 0)',
    },
  },
});

export const nav = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  width: '100%',
  height: archVars.top,
  ...absolutePosition.topLeft(),
});

// One side
export const list = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  flexGrow: '1',
  width: '50%',
  selectors: {
    '&[data-side="left"]': {
      justifyContent: 'flex-end',
      order: 0,
      paddingRight: '50px', // TODO set dynamically with width of logo
    },
    '&[data-side="right"]': {
      justifyContent: 'flex-start',
      order: 1,
      paddingLeft: '50px', // TODO set dynamically with width of logo
    },
  },
});

export const item = style({
  // flex: '0 0 auto',
  // whiteSpace: 'nowrap',
  // display: 'flex',
  // alignItems: 'center',
});

// Intentionally reorder so the logo is the first item visually but not in DOM
export const item_1 = style({
  // order: 0,
});
export const item_2 = style({
  // order: 0,
});

// Logo in the middle
export const logoItem = style({
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: `translateX(-${logoVars.width.value / 2}${logoVars.width.unit})`,
  width: logoVars.width.css(),
  height: logoVars.width.css(),
  ...flexPosition.center(),
});

export const item_3 = style({
  order: 2,
});

export const item_4 = style({
  order: 2,
});

export const headerNavItem = style({
  ...absolutePosition.topRight(),
  order: 5,
});

export const logoLink = style({
  ...flexPosition.center(),
  width: logoVars.width.css(),
  height: logoVars.width.css(),
  transform: `translateY(${logoVars.offsetY.css()})`,
});

export const link = style({
  textDecoration: 'none',
  fontWeight: 600,
  borderRadius: 8,
  padding: '0.25rem 0.5rem',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
    '&[data-active="true"]': { background: 'rgba(0,0,0,0.06)' }, // state via data-attr
    '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 },
  },
});

export const logo = style({
  width: logoVars.width.css(),
  height: 'auto',
  // filter: 'drop-shadow( 0px 10px 2px rgba(0, 0, 0, .7))',
});

export const localeChanger = style({
  ...absolutePosition.topRight(),
});

export const navLink = style({
  color: colorVars.navFg.css(),
  textDecoration: 'none',
  selectors: {
    '&:visited': {
      color: colorVars.navFg.css(),
    },
  },
});
