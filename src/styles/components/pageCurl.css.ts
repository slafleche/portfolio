import { globalStyle, style } from '@vanilla-extract/css';
import { paddings, margins } from '../helpers/spacing.helper';
import { backgrounds } from '../helpers/background.helper';
import { borders } from '../helpers/borders.helper';
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
  overflow: 'hidden',
  ...backgrounds({
    color: '#ffffff',
  }),
});

export const content = style({
  ...paddings(m(24)),
});

export const title = style({
  ...margins({
    bottom: m(15),
  }),
  color: '#900',
  fontSize: '16pt',
});

export const text = style({
  ...margins({
    bottom: m(8),
  }),
});

export const cornerBox = style({
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '20px',
  height: '20px',
  overflow: 'visible',
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const pageTip = style({
  position: 'absolute',
  inset: 0,
  ...backgrounds({
    image:
      'linear-gradient(225deg, #ddd 17%, #dfdfdf 18%, #f5f5f5 30%, #f8f8f8 34%, #eee 39%, rgba(200, 200, 200, 0) 41%)',
  }),
  ...borders.radii({
    radius: {
      sw: m(60, '%'),
    },
  }),
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
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
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const cornerBase = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '100%',
  ...backgrounds({
    color: '#eeeef4',
  }),
});

export const behindCode = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: '200px',
  overflow: 'hidden',
});

export const cornerButton = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '7em',
  ...paddings({
    vertical: m(8),
    horizontal: m(5),
  }),
  ...backgrounds({
    color: '#900',
  }),
  color: '#fff',
  textAlign: 'center',
  ...borders.radii({
    radius: {
      all: m(5),
    },
  }),
  fontSize: '11px',
  fontFamily: 'Verdana, Geneva, sans-serif',
  display: 'inline-block',
});

export const cornerHighlight = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '133%',
  height: '133%',
  ...backgrounds({
    image:
      'linear-gradient(225deg, rgba(255,255,255,0) 37%, #ddd 62%, rgba(230,230,230,0.1) 64%, rgba(255,255,255,0) 67%), radial-gradient(circle at 150% -150%, transparent 74%, rgba(0,0,0,0.2) 74%, transparent 81%)',
  }),
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
  ...borders.radii({
    radius: {
      sw: m(60, '%'),
    },
  }),
  ...backgrounds({
    color: '#ffffff',
    image:
      'linear-gradient(0deg, rgba(255,255,255,0), rgba(255,255,255,0)), radial-gradient(circle at 180% -200%, rgba(255,255,255,0) 80%, rgba(0,0,0,0.2) 100%)',
  }),
  zIndex: 2,
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

export const pageTipShadeTop = style({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  width: '50%',
  height: '50%',
  ...borders.radii({
    radius: {
      sw: m(60, '%'),
    },
  }),
  ...backgrounds({
    color: '#ffffff',
    image:
      'linear-gradient(0deg, rgba(255,255,255,0), rgba(255,255,255,0)), radial-gradient(circle at 250% -320%, rgba(255,255,255,0) 80%, rgba(0,0,0,0.2) 100%)',
  }),
  zIndex: 2,
  transition: 'all 260ms cubic-bezier(0.18, 0.6, 0.22, 1)',
});

// Hover interactions: grow the corner and accent the curl when the box is hovered
globalStyle(`.${root}:hover .${cornerBox}`, {
  width: '100px',
  height: '100px',
});

globalStyle(`.${root}:hover .${pageTipShadeRight}`, {
  ...borders.left({
    width: m(2),
    color: '#ffffff',
  }),
});

globalStyle(`.${root}:hover .${pageTipShadeTop}`, {
  ...borders.bottom({
    width: m(2),
    color: '#ffffff',
  }),
});
