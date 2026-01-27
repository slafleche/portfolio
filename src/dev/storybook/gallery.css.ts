import { globalStyle, style } from '@vanilla-extract/css';

import * as ws from '@/styles/components/card.css';

export const root = style({
  minHeight: '100vh',
  padding: 24,
  background: '#000',
  color: '#fff',
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji',
});

export const title = style({
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
});

export const subtitle = style({
  margin: '8px 0 16px',
  opacity: 0.75,
});

export const sectionTitle = style({
  margin: '22px 0 0',
  fontSize: 16,
  fontWeight: 600,
});

export const sectionSubtitle = style({
  margin: '6px 0 12px',
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
  marginBottom: '25px',
});

export const svgTile = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100%',
  rowGap: 10,
  padding: 12,
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.10)',
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
