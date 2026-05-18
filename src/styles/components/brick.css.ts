import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { borderVars, colorVars } from '../../tokens/global.tokens';
import { brickLayout } from '../componentTokens/brick.component.tokens';
import { borders } from '../helpers/borders.helper';
import { makeGlassSurface } from '../helpers/glassy.helper';
import { textShadow } from '../helpers/shadow.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { userContent } from '../typography.css';

export const root = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  ...borders.radii(borderVars),
  ...paddings(brickLayout.paddings),
  ...makeGlassSurface(),
});

export const iconAsBg = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  opacity: 0.1,
  zIndex: 0,
  overflow: 'hidden',
});

export const content = style({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  ...textShadow({
    x: m(1),
    y: m(1),
    blur: m(2),
    color: colorVars.black,
  }),
});

export const title = style({});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
});

globalStyle(`.${body} .${userContent} p[data-last="true"]`, {
  ...paddings({ bottom: 0 }),
  ...margins({ bottom: 0 }),
});
