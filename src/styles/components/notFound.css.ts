import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';

import { colors } from '../../tokens/global.tokens';
import { borders } from '../helpers/borders.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

export const root = style({
  minHeight: [
    '100vh',
    '100dvh',
  ],
  display: 'grid',
  placeItems: 'center',
  color: colors.white.css(),
  textAlign: 'center',
});

export const heading = style({
  paddingTop: 0,
  fontSize: 'clamp(20px, 6vw, 50px)',
  lineHeight: 1.2,
  ...paddings({
    bottom: m(20),
  }),
  ...borders({
    bottom: {
      width: m(1),
      color: colors.white.alpha(0.5).css(),
    },
  }),
  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...margins({
          horizontal: m(35),
        }),
      },
    }),
  },
});

export const backLink = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  color: colors.white.css(),
  marginTop: '20px',
  fontSize: 'clamp(1em, 4vw, 1em)',
  selectors: {
    ...mediaQueryStyle({
      compressed: {
        fontSize: '1em',
        flexDirection: 'column-reverse',
      },
    }),
  },
});

export const backLinkIcon = style({
  width: '35px',
  height: 'auto',
  ...margins({
    right: m(10),
  }),
  opacity: 0.8,
  selectors: {
    ...mediaQueryStyle({
      compressed: {
        ...margins({
          right: m(0),
        }),
      },
    }),
  },
});
