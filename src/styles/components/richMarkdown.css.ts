import { style } from '@vanilla-extract/css';
import { m } from 'css-calipers';
import { margins } from '../helpers/spacing.helper';

export const caseStudyNoLogoText = style({
  selectors: {
    '&[data-position="before"]': {
      ...margins({
        left: m(0.5, 'em'),
      }),
    },
    '&[data-position="after"]': {
      ...margins({
        right: m(0.5, 'em'),
      }),
    },
  },
});

const caseStudyLogoHeight = m(2.1, 'em');
const caseStudyLogoOffset = caseStudyLogoHeight.divide(9.3).round(3);

export const caseStudyLogo = style({
  display: 'inline-block',
  height: caseStudyLogoHeight.css(),
  transform: `translateY(${caseStudyLogoOffset.css()})`,
  width: 'auto',
  verticalAlign: 'baseline',
});
