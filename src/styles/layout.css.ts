import { style } from '@vanilla-extract/css';
import { globalMediaQueryStyles } from './responsive/mediaQueries';
import { paddings } from './helpers/spacing';
import { layoutVars } from './vars/layout.vars';

export const content = style({
  position: 'relative',
  width: '100%',
  maxWidth: layoutVars.contentWidth.css(),
  margin: 'auto',
  ...paddings({
    horizontal: layoutVars.contentPadding,
  }),
  ...globalMediaQueryStyles({
    compact: {
      ...paddings({
        horizontal: layoutVars.compact.contentPadding,
      }),
    },
    compressed: {
      ...paddings({
        horizontal: layoutVars.compressed.contentPadding,
      }),
    },
  }),
});

export const title = style({});

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
});

export const page = style({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

export const main = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  rowGap: 'clamp(2rem, 4vw, 4rem)',
});
