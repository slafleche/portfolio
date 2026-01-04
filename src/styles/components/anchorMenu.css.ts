import { globalStyle, style } from '@vanilla-extract/css';
import { anchorMenuVars, logoVars } from '../../tokens/menu.tokens';
import { paddings } from '../helpers/spacing.helper';
import { borders } from '../helpers/borders.helper';
import { backgrounds } from '../helpers/background.helper';
import { m, mPercent } from 'css-calipers';
import { themeColours } from '../../tokens/global.tokens';
import { textShadow } from '../helpers/shadow.helper';
import { makeGlassSurface } from '../helpers/glassy.helper';
import { relativeFontWeight } from '../helpers/typography.helper';
import { fontFamilies } from '../../tokens/fontFamilies.tokens';

export const root = style({
  position: 'fixed',
  top: 0,
  left: logoVars.offsetX
    .add(logoVars.width.subtract(anchorMenuVars.handle.size).half())
    .subtract(anchorMenuVars.dot.borders.width)
    .css(),
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none',
  justifyContent: 'center',
  ...paddings(anchorMenuVars.margins),
});

export const list = style({
  position: 'relative',
  // left: anchorMenuVars.dot.paddings.css(),
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minWidth: '100%',
  height: '100%',
  color: 'inherit',
  textDecoration: 'none',
  outline: 'none',
  pointerEvents: 'auto',
  cursor: 'pointer',
});

export const dot = style({
  display: 'block',
  width: anchorMenuVars.size.css(),
  height: anchorMenuVars.size.css(),
  ...backgrounds({ color: 'transparent' }),
  ...borders(anchorMenuVars.dot.borders),
});

export const handle = style({
  display: 'flex',
  alignItems: 'center',
  justifyItems: 'center',
  minWidth: anchorMenuVars.handle.size.css(),
  height: anchorMenuVars.handle.size.css(),
  width: 'auto',

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
  display: 'grid',
  gridTemplateColumns: '0fr',
  alignItems: 'center',
  transition: 'grid-template-columns 0.4s ease',
  height: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  // width: '0%',
  // flexGrow: 0,
  // flexShrink: 0,
  // flexBasis: '0%',
  // minWidth: 0,
});

export const label = style({
  display: 'flex',
  alignItems: 'center',
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  lineHeight: 1,
  transformOrigin: '0 50%',
  ...relativeFontWeight(fontFamilies.ibm, mPercent(50)),
  ...textShadow(anchorMenuVars.text.textShadow),
  selectors: {
    '&::after': {
      content: '""',
      display: 'inline-block',
      width: anchorMenuVars.handle.spacing.css(),
      flexShrink: 0,
    },
  },
});

export const item = style({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: 'auto',
  minWidth: anchorMenuVars.handle.size.css(),
  height: anchorMenuVars.handle.size.css(),
  // width: 'auto', // Add this to allow growth
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

globalStyle(
  `.${link}:hover .${labelWrapper}, .${link}:focus-visible .${labelWrapper}`,
  {
    gridTemplateColumns: '1fr',
  },
);

globalStyle(`.${link}:hover .${dot}, .${link}:focus .${dot}`, {
  ...backgrounds({ color: themeColours.secondary }),
});

globalStyle(
  `.${link}:hover .${handle}, .${link}:focus .${handle}, .${link}:focus-visible .${handle}`,
  {
    ...makeGlassSurface(),
  },
);
