import { globalStyle, style } from '@vanilla-extract/css';
import { paddings } from '../helpers/spacing.helper';
import { m } from 'css-calipers';

export const root = style({
  display: 'inline-block',
  textDecoration: 'none',
  color: 'inherit',
});

export const box = style({
  position: 'relative',
  width: '500px',
  maxWidth: '100%',
  height: '500px',
  backgroundColor: '#ffffff',
  overflow: 'hidden',
});

export const content = style({
  ...paddings(m(24)),
});

export const title = style({
  margin: '0 0 15px 0',
  color: '#900',
  fontSize: '16pt',
});

export const text = style({
  margin: '0 0 8px 0',
});

export const cornerBox = style({
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '20px',
  height: '20px',
  overflow: 'visible',
  transition:
    'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const pageTip = style({
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(225deg, #ddd 17%, #dfdfdf 18%, #f5f5f5 30%, #f8f8f8 34%, #eee 39%, rgba(200, 200, 200, 0) 41%)',
  borderBottomLeftRadius: '60%',
  transition:
    'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const cornerContents = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '125%',
  height: '125%',
  overflow: 'hidden',
  mask: 'linear-gradient(225deg, transparent 49%, #000 53%)',
  WebkitMask: 'linear-gradient(225deg, transparent 49%, #000 53%)',
  transition:
    'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const cornerBase = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: '#eeeef4',
});

export const cornerHighlight = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '133%',
  height: '133%',
  background:
    'linear-gradient(225deg, rgba(255,255,255,0) 37%, #ddd 62%, rgba(230,230,230,0.1) 64%, rgba(255,255,255,0) 67%), radial-gradient(circle at 150% -150%, transparent 74%, rgba(0,0,0,0.2) 74%, transparent 81%)',
});

export const cornerButton = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '7em',
  padding: '8px 5px',
  backgroundColor: '#900',
  color: '#fff',
  textAlign: 'center',
  borderRadius: '5px',
  fontSize: '11px',
  fontFamily: 'Verdana, Geneva, sans-serif',
  display: 'inline-block',
});

export const cornerButtonLabel = style({
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
});

export const pageTipShadeRight = style({
  position: 'absolute',
  left: '100%',
  bottom: 0,
  width: '50%',
  height: '50%',
  borderBottomLeftRadius: '60%',
  background:
    'radial-gradient(circle at 180% -200%, rgba(255,255,255,0) 80%, rgba(0,0,0,0.2) 100%)',
  backgroundColor: '#ffffff',
  zIndex: 2,
  transition:
    'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const pageTipShadeTop = style({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  width: '50%',
  height: '50%',
  borderBottomLeftRadius: '60%',
  background:
    'radial-gradient(circle at 250% -320%, rgba(255,255,255,0) 80%, rgba(0,0,0,0.2) 100%)',
  backgroundColor: '#ffffff',
  zIndex: 2,
  transition:
    'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

// Hover interactions: grow the corner and accent the curl when the box is hovered
globalStyle(`.${box}:hover .${cornerBox}`, {
  width: '100px',
  height: '100px',
});

globalStyle(`.${box}:hover .${pageTipShadeRight}`, {
  borderLeft: '2px solid #ffffff',
});

globalStyle(`.${box}:hover .${pageTipShadeTop}`, {
  borderBottom: '2px solid #ffffff',
});
