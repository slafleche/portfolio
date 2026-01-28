import { globalStyle, style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import * as ws from '@/styles/components/card.css';
import { backgrounds } from '@/styles/helpers/background.helper';
import { borders } from '@/styles/helpers/borders.helper';
import { margins } from '@/styles/helpers/spacing.helper';
import { colorVars } from '@/tokens/global.tokens';

export const root = style({
  minHeight: '100vh',
  padding: 24,
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji',
});

export const title = style({
  ...margins(0),
  fontSize: 18,
  fontWeight: 600,
});

export const subtitle = style({
  ...margins({
    top: m(8),
    bottom: m(16),
    horizontal: 0,
  }),
  opacity: 0.75,
});

export const sectionTitle = style({
  ...margins({
    top: m(22),
    bottom: 0,
    horizontal: 0,
  }),
  fontSize: 16,
  fontWeight: 600,
});

export const sectionSubtitle = style({
  ...margins({
    top: m(6),
    bottom: m(12),
    horizontal: 0,
  }),
  opacity: 0.75,
});

export const grid = style({
  display: 'grid',
  gap: 12,
  alignItems: 'stretch',
});

export const gridIcons = style({
  display: 'grid',
  gap: 12,
  alignItems: 'stretch',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
});

export const gridLogos = style({
  display: 'grid',
  gap: 12,
  alignItems: 'stretch',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  ...margins({
    bottom: m(25),
  }),
});

export const svgTile = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100%',
  rowGap: 10,
  padding: 12,
  ...backgrounds({
    color: colorVars.white.alpha(0.06),
  }),
  ...borders({
    width: m(1),
    color: colorVars.white.alpha(0.1),
    radius: m(12),
  }),
  textAlign: 'center',
});

export const svgTileIcon = style({
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
  height: '100px',
});

export const svgTitleLabel = style({
  fontSize: 12,
  opacity: 0.9,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
});

export const pulse = style({
  width: '56px',
  height: '56px',
});

export const businessLogoContainer = style({
  position: 'relative',
  width: '100px',
  height: '100px',
});

export const siteLogoContainer = style({
  width: '120px',
  height: '100px',
  display: 'grid',
  placeItems: 'center',
});

globalStyle(`.${businessLogoContainer}[data-target="oracle"]`, {
  width: '150px',
});

globalStyle(`.${businessLogoContainer}[data-target="king"]`, {
  width: '120px',
});

globalStyle(`.${businessLogoContainer}[data-target="acer"]`, {
  width: '120px',
});

globalStyle(
  `
  .${root} .${ws.wordMark_banq}, 
  .${root} .${ws.wordMark_cc}, 
  .${root} .${ws.wordMark_ea}, 
  .${root} .${ws.wordMark_hs}, 
  .${root} .${ws.wordMark_kg}, 
  .${root} .${ws.wordMark_vanilla}
  `,
  {
    width: '100px',
    height: 'auto',
  },
);
