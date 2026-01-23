import { style } from '@vanilla-extract/css';
import { m, mPercent } from 'css-calipers';

import { exampleSitesVars } from '../../tokens/exampleSites.tokens';
import { absolutePosition } from '../helpers/positioning.helper';
import { margins, paddings } from '../helpers/spacing.helper';
import { mediaQueryStyle } from '../responsive/mediaQueries';

export const root = style({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '25px',
  selectors: {
    ...mediaQueryStyle({
      compact: {
        ...margins({
          top: m(35),
        }),
        flexDirection: 'column',
      },
    }),
  },
});

export const icon = style({
  ...absolutePosition.fullSize(),
});

export const link = style({
  position: 'relative',
  display: 'block',
  textDecoration: 'none',
  selectors: {
    '&::before': {
      content: '""',
      display: 'block',
    },
  },
});

export const kg = style({});

export const kgLink = style({
  width: exampleSitesVars.kg.width.css(),
  ...margins(exampleSitesVars.kg.offset),
  selectors: {
    '&::before': {
      ...paddings({
        top: mPercent(
          exampleSitesVars.kg.ratio.denominator() /
            exampleSitesVars.kg.ratio.numerator(),
        )
          .multiply(100)
          .round(2),
      }),
    },
  },
});

export const oracle = style({});

export const oracleLink = style({
  width: exampleSitesVars.oracle.width.css(),
  ...margins(exampleSitesVars.oracle.offset),
  selectors: {
    '&::before': {
      ...paddings({
        top: mPercent(
          exampleSitesVars.oracle.ratio.denominator() /
            exampleSitesVars.oracle.ratio.numerator(),
        )
          .multiply(100)
          .round(2),
      }),
    },
  },
});

export const acer = style({});

export const acerLink = style({
  width: exampleSitesVars.acer.width.css(),
  ...margins(exampleSitesVars.acer.offset),
  selectors: {
    '&::before': {
      ...paddings({
        top: mPercent(
          exampleSitesVars.acer.ratio.denominator() /
            exampleSitesVars.acer.ratio.numerator(),
        )
          .multiply(100)
          .round(2),
      }),
    },
  },
});
