import { globalStyle, style } from '@vanilla-extract/css';
import { anchorMenuVars } from '../../tokens/menu.tokens';
import { margins, paddings } from '../helpers/spacing.helper';
import { borders } from '../helpers/borders.helper';
import { m, mPercent } from 'css-calipers';

export const root = style({
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100%',
  width: `calc(${anchorMenuVars.size.css()} + ${anchorMenuVars.margins.left.css()})`,
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none',
  ...paddings(anchorMenuVars.margins),
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: anchorMenuVars.innerGap.css(),
  alignItems: 'flex-start',
  pointerEvents: 'auto',
  selectors: {
    '&[data-ui="list-unordered"]': {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
  },
});

export const link = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  color: 'inherit',
  textDecoration: 'none',
  outline: 'none',
  pointerEvents: 'auto',
});

export const dot = style({
  display: 'block',
  width: anchorMenuVars.size.css(),
  height: anchorMenuVars.size.css(),

  background: 'transparent',
  ...borders({
    radius: mPercent(50),
    width: m(1),
    color: 'rgba(255, 255, 255, 0.8)',
  }),
  // transition:
  //   'transform 160ms ease, background 160ms ease, border-color 160ms ease',
  // selectors: {
  //   [`.${link}:hover &`]: {
  //     background: 'rgba(255, 255, 255, 0.95)',
  //   },
  //   [`.${link}:focus-visible &`]: {
  //     background: 'rgba(255, 255, 255, 0.95)',
  //   },
  //   [`.${link}[data-active="true"] &`]: {
  //     background: 'rgba(255, 255, 255, 0.95)',
  //   },
  // },
});

export const handle = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: anchorMenuVars.handle.size.css(),
  height: anchorMenuVars.handle.size.css(),
  ...borders({
    radius: anchorMenuVars.handle.size.half(),
    width: m(1),
    color: 'transparent',
  }),
});

export const dotWrapper = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  height: anchorMenuVars.handle.size.css(),
  width: anchorMenuVars.handle.size.css(),
});

export const labelWrapper = style({
  height: '100%',
  whiteSpace: 'nowrap',
});

export const label = style({
  ...paddings({
    right: anchorMenuVars.dot.paddings,
  }),
  // display: 'inline-block',
  // transformOrigin: 'left center',
  // transform: 'scaleX(0)',
  // opacity: 0,
});

export const item = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: anchorMenuVars.handle.size.css(),
  height: anchorMenuVars.handle.size.css(),
});

globalStyle(
  `.${link}:hover .${handle}, .${link}:focus .${handle}, .${link}:focus-visible .${handle}`,
  {
    ...borders(
      {
        color: 'rgba(255, 255, 255, 0.8)',
      },
      {
        skipDefaults: true,
      },
    ),
  },
);
