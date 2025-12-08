import { style } from '@vanilla-extract/css';
import { colorVars, consoleVars } from '../../tokens/global.tokens';
import { paddings, margins } from '../helpers/spacing.helper';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
import { boxShadow } from '../helpers/shadow.helper';
import { m, mPercent } from 'css-calipers';

const consoleFontStack = `"JetBrains Mono", "Fira Code", "SFMono-Regular", "Menlo", "Consolas", "Liberation Mono", monospace`;

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: '100%',
  minHeight: '475px',
  borderRadius: consoleVars.borders.radius.css(),
  border: `1px solid ${colorVars.white.alpha(0.12).css()}`,
  background: `linear-gradient(160deg, ${colorVars.black.alpha(0.85).css()} 0%, ${colorVars.contrast.alpha(0.22).css()} 100%)`,

  ...boxShadow({
    x: m(10),
    y: m(30),
    blur: m(30),
    color: colorVars.black,
    alpha: 0.45,
  }),
  overflow: 'hidden',
  color: colorVars.white.alpha(0.86).css(),
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  ...paddings({
    vertical: m(10),
    horizontal: m(16),
  }),
  background: colorVars.black.alpha(0.6).css(),
  borderBottom: `1px solid ${colorVars.white.alpha(0.06).css()}`,
});

export const windowDot = style({
  width: '10px',
  height: '10px',
  ...borders.radii({ radius: mPercent(50) }),
  ...backgrounds({ color: '#ff5f56' }),
  selectors: {
    '&[data-variant="warn"]': {
      ...backgrounds({ color: '#ffbd2e' }),
    },
    '&[data-variant="success"]': {
      ...backgrounds({ color: '#27c93f' }),
    },
  },
});

export const title = style({
  ...margins({ left: 'auto' }),
  fontSize: '14px',
  fontFamily: consoleFontStack,
  color: colorVars.white.alpha(0.5).css(),
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontFamily: consoleFontStack,
  fontSize: '16px',
  lineHeight: 1.6,
  flexGrow: 1,
  ...paddings(m(18)),

  backgroundColor: colorVars.black.mix(colorVars.white, 0.005).css(),
  justifyContent: 'flex-end',
  overflowY: 'auto',
});

export const line = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: '12px',
  alignItems: 'baseline',
  color: colorVars.white.alpha(0.4).css(),
});

export const lineNumber = style({
  color: colorVars.white.alpha(0.35).css(),
  textAlign: 'right',
});

export const code = style({
  whiteSpace: 'pre',
});

export const accent = style({
  color: colorVars.contrast.alpha(0.45).css(),
});

export const comment = style({
  color: colorVars.white.alpha(0.3).css(),
  fontStyle: 'italic',
});
